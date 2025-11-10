import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default mergeConfig(
  defineConfig({
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1000, // Increase limit to 1000 KB
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'aws-sdk': [
              '@aws-sdk/client-s3',
              '@aws-sdk/client-dynamodb',
              '@aws-sdk/client-sqs',
              '@aws-sdk/client-sns',
              '@aws-sdk/client-lambda',
              '@aws-sdk/lib-dynamodb',
              '@aws-sdk/s3-request-presigner',
            ],
            'aws-sdk-extras': [
              '@aws-sdk/client-cloudwatch',
              '@aws-sdk/client-secrets-manager',
            ],
            'ui-libs': ['lucide-react', 'zustand'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/localstack': {
          target: 'http://localhost:4566',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/localstack/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('Proxying:', req.method, req.url);
            });
          },
        },
      },
    },
  }),
  defineVitestConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/dist/**',
        ],
      },
    },
  })
);
