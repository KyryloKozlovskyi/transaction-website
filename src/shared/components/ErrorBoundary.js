import React from "react";
import logger from "../utils/logger";
import { ERROR_MESSAGES } from "../constants";

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and monitoring service
    logger.error("Error Boundary caught an error", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || "ErrorBoundary",
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <svg
                style={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 style={styles.title}>Oops! Something went wrong</h1>
            <p style={styles.message}>
              {this.props.errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR}
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>
                  Error Details (Development Only)
                </summary>
                <div style={styles.errorDetails}>
                  <p style={styles.errorMessage}>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre style={styles.stackTrace}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div style={styles.buttonGroup}>
              <button style={styles.primaryButton} onClick={this.handleReset}>
                Try Again
              </button>
              <button
                style={styles.secondaryButton}
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>

            {this.state.errorCount > 2 && (
              <p style={styles.persistentError}>
                This error keeps occurring. Please contact support if the
                problem persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Default styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: "20px",
  },
  card: {
    maxWidth: "600px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "40px",
    textAlign: "center",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  icon: {
    width: "64px",
    height: "64px",
    color: "#ef4444",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "12px",
  },
  message: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  details: {
    textAlign: "left",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#fef2f2",
    borderRadius: "4px",
    border: "1px solid #fecaca",
  },
  summary: {
    cursor: "pointer",
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: "12px",
  },
  errorDetails: {
    marginTop: "12px",
  },
  errorMessage: {
    fontSize: "14px",
    color: "#991b1b",
    marginBottom: "8px",
  },
  stackTrace: {
    fontSize: "12px",
    color: "#7f1d1d",
    backgroundColor: "#fee2e2",
    padding: "12px",
    borderRadius: "4px",
    overflow: "auto",
    maxHeight: "200px",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  secondaryButton: {
    padding: "12px 24px",
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  persistentError: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#dc2626",
    fontStyle: "italic",
  },
};

export default ErrorBoundary;
