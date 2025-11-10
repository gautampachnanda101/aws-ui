import { describe, it, expect } from 'vitest';
import { logger } from '../services/logger';

describe('Logger Service', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function');
  });

  it('should have info method', () => {
    expect(typeof logger.info).toBe('function');
  });

  it('should log error without throwing', () => {
    expect(() => {
      logger.error('Test error', new Error('Test'));
    }).not.toThrow();
  });

  it('should log info without throwing', () => {
    expect(() => {
      logger.info('Test info');
    }).not.toThrow();
  });
});
