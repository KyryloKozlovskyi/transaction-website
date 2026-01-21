/**
 * Frontend Logger Utility
 * Provides structured logging for the React application
 * Respects environment variables and provides different levels of logging
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

class Logger {
  constructor() {
    // Set log level based on environment
    const isDevelopment = process.env.NODE_ENV === "development";
    const logLevel =
      process.env.REACT_APP_LOG_LEVEL || (isDevelopment ? "DEBUG" : "ERROR");
    this.currentLevel = LOG_LEVELS[logLevel.toUpperCase()] || LOG_LEVELS.INFO;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr =
      Object.keys(context).length > 0 ? JSON.stringify(context) : "";
    return {
      timestamp,
      level,
      message,
      context,
      formatted: `[${timestamp}] [${level}] ${message} ${contextStr}`,
    };
  }

  /**
   * Log debug messages (development only)
   */
  debug(message, context) {
    if (this.currentLevel <= LOG_LEVELS.DEBUG) {
      const formatted = this.formatMessage("DEBUG", message, context);
      console.log(formatted.formatted, context || "");
    }
  }

  /**
   * Log informational messages
   */
  info(message, context) {
    if (this.currentLevel <= LOG_LEVELS.INFO) {
      const formatted = this.formatMessage("INFO", message, context);
      console.info(formatted.formatted, context || "");
    }
  }

  /**
   * Log warning messages
   */
  warn(message, context) {
    if (this.currentLevel <= LOG_LEVELS.WARN) {
      const formatted = this.formatMessage("WARN", message, context);
      console.warn(formatted.formatted, context || "");
    }
  }

  /**
   * Log error messages
   */
  error(message, error, context = {}) {
    if (this.currentLevel <= LOG_LEVELS.ERROR) {
      const errorContext = {
        ...context,
        errorMessage: error?.message,
        errorStack: error?.stack,
        errorName: error?.name,
      };
      const formatted = this.formatMessage("ERROR", message, errorContext);
      console.error(formatted.formatted, error, errorContext);

      // In production, you could send errors to a monitoring service here
      if (process.env.NODE_ENV === "production") {
        this.sendToMonitoring(formatted);
      }
    }
  }

  /**
   * Send errors to monitoring service (placeholder)
   */
  sendToMonitoring(logData) {
    // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
    // For now, just store in session storage for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem("app_errors") || "[]");
      errors.push(logData);
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      sessionStorage.setItem("app_errors", JSON.stringify(errors));
    } catch (e) {
      // Silently fail if storage is not available
    }
  }

  /**
   * Log API requests (useful for debugging)
   */
  apiRequest(method, url, data) {
    this.debug(`API Request: ${method} ${url}`, { method, url, data });
  }

  /**
   * Log API responses
   */
  apiResponse(method, url, status, data) {
    this.debug(`API Response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      data,
    });
  }

  /**
   * Log API errors
   */
  apiError(method, url, error) {
    this.error(`API Error: ${method} ${url}`, error, { method, url });
  }

  /**
   * Log component lifecycle events (development only)
   */
  componentMount(componentName) {
    this.debug(`Component mounted: ${componentName}`);
  }

  componentUnmount(componentName) {
    this.debug(`Component unmounted: ${componentName}`);
  }

  /**
   * Log user actions
   */
  userAction(action, details) {
    this.info(`User action: ${action}`, details);
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
