/**
 * Structured logger following Google Cloud Logging standards
 * https://cloud.google.com/logging/docs/structured-logging
 */

export enum LogSeverity {
  DEFAULT = 'DEFAULT',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  NOTICE = 'NOTICE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  ALERT = 'ALERT',
  EMERGENCY = 'EMERGENCY',
}

interface LogEntry {
  severity: LogSeverity;
  message: string;
  timestamp: string;
  trace?: string;
  spanId?: string;
  component?: string;
  operation?: string;
  [key: string]: any;
}

class Logger {
  private component: string;

  constructor(component = 'app') {
    this.component = component;
  }

  private log(
    severity: LogSeverity,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      severity,
      message,
      timestamp: new Date().toISOString(),
      component: this.component,
      ...metadata,
    };

    // In production, this would send to Google Cloud Logging
    // For development, we use console with structured format
    const logMethod = this.getConsoleMethod(severity);

    if (process.env.NODE_ENV === 'production') {
      // Output as JSON for log aggregation
      logMethod(JSON.stringify(entry));
    } else {
      // Pretty print for development
      logMethod(
        `[${entry.timestamp}] [${entry.severity}] [${entry.component}]`,
        entry.message,
        metadata ? metadata : ''
      );
    }
  }

  private getConsoleMethod(severity: LogSeverity): typeof console.log {
    switch (severity) {
      case LogSeverity.DEBUG:
      case LogSeverity.DEFAULT:
        return console.debug;
      case LogSeverity.INFO:
      case LogSeverity.NOTICE:
        return console.info;
      case LogSeverity.WARNING:
        return console.warn;
      case LogSeverity.ERROR:
      case LogSeverity.CRITICAL:
      case LogSeverity.ALERT:
      case LogSeverity.EMERGENCY:
        return console.error;
      default:
        return console.log;
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogSeverity.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogSeverity.INFO, message, metadata);
  }

  notice(message: string, metadata?: Record<string, any>): void {
    this.log(LogSeverity.NOTICE, message, metadata);
  }

  warning(message: string, metadata?: Record<string, any>): void {
    this.log(LogSeverity.WARNING, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogSeverity.ERROR, message, {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }

  critical(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogSeverity.CRITICAL, message, {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }

  // Create a child logger with a specific component/operation context
  child(component: string): Logger {
    return new Logger(`${this.component}.${component}`);
  }
}

// Export singleton instance
export const logger = new Logger('localstack-ui');

// Export factory for creating component-specific loggers
export const createLogger = (component: string): Logger => {
  return new Logger(component);
};
