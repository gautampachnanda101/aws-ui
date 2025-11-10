import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppConfig, LocalStackConfig } from '../types';
import defaultConfig from '../config/default-config.json';

interface ConfigState {
  config: AppConfig;
  currentInstance: LocalStackConfig | null;
  loadConfig: (config: AppConfig) => void;
  setCurrentInstance: (instanceName: string) => void;
  addInstance: (instance: LocalStackConfig) => void;
  removeInstance: (instanceName: string) => void;
  updateInstance: (instanceName: string, instance: LocalStackConfig) => void;
  resetToDefaults: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: defaultConfig as AppConfig,
      currentInstance: null,

      loadConfig: (config: AppConfig) => {
        set({ config });
        const defaultInstance = config.localstackInstances.find(
          (i) => i.name === config.defaultInstance
        );
        if (defaultInstance) {
          set({ currentInstance: defaultInstance });
        }
      },

      setCurrentInstance: (instanceName: string) => {
        const instance = get().config.localstackInstances.find(
          (i) => i.name === instanceName
        );
        if (instance) {
          set({ currentInstance: instance });
        }
      },

      addInstance: (instance: LocalStackConfig) => {
        const config = get().config;
        set({
          config: {
            ...config,
            localstackInstances: [...config.localstackInstances, instance],
          },
        });
      },

      removeInstance: (instanceName: string) => {
        const config = get().config;
        set({
          config: {
            ...config,
            localstackInstances: config.localstackInstances.filter(
              (i) => i.name !== instanceName
            ),
          },
        });
      },

      updateInstance: (instanceName: string, instance: LocalStackConfig) => {
        const config = get().config;
        set({
          config: {
            ...config,
            localstackInstances: config.localstackInstances.map((i) =>
              i.name === instanceName ? instance : i
            ),
          },
        });
      },

      resetToDefaults: () => {
        const defaultInstance = (defaultConfig as AppConfig).localstackInstances.find(
          (i) => i.name === (defaultConfig as AppConfig).defaultInstance
        );
        set({
          config: defaultConfig as AppConfig,
          currentInstance: defaultInstance || null,
        });
      },
    }),
    {
      name: 'localstack-config-v2',
    }
  )
);

// Initialize with default config on first load
const store = useConfigStore.getState();
if (!store.currentInstance && store.config.localstackInstances.length > 0) {
  store.setCurrentInstance(store.config.defaultInstance);
}
