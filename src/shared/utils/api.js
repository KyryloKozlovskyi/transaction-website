import axios from "axios";
import { auth } from "../../config/config";
import logger from "./logger";
import { HTTP_STATUS, ERROR_MESSAGES, RETRY_CONFIG } from "../constants";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Retry helper function
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error, retryCount) => {
  if (retryCount >= RETRY_CONFIG.MAX_RETRIES) {
    return false;
  }

  // Retry on network errors
  if (!error.response) {
    return true;
  }

  // Retry on specific status codes
  const status = error.response.status;
  return RETRY_CONFIG.RETRY_STATUSES.includes(status);
};

/**
 * Exponential backoff calculation
 */
const getRetryDelay = (retryCount) => {
  return RETRY_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
};

/**
 * Request interceptor - Add authentication and logging
 */
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        logger.apiRequest(config.method.toUpperCase(), config.url, config.data);
      } catch (error) {
        logger.error("Error getting Firebase token", error);
        throw error;
      }
    } else {
      logger.debug("No Firebase user logged in for request", {
        url: config.url,
      });
    }

    // Add retry count to config
    config.retryCount = config.retryCount || 0;

    return config;
  },
  (error) => {
    logger.error("Request interceptor error", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and retries
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    logger.apiResponse(
      response.config.method.toUpperCase(),
      response.config.url,
      response.status,
      response.data
    );
    return response;
  },
  async (error) => {
    const config = error.config;

    // Log API error
    logger.apiError(
      config?.method?.toUpperCase() || "UNKNOWN",
      config?.url || "UNKNOWN",
      error
    );

    // Handle specific error cases
    if (!error.response) {
      // Network error
      error.userMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else {
      const status = error.response.status;
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          error.userMessage = ERROR_MESSAGES.AUTH_FAILED;
          // Optionally trigger logout
          break;
        case HTTP_STATUS.FORBIDDEN:
          error.userMessage = ERROR_MESSAGES.ACCESS_DENIED;
          break;
        case HTTP_STATUS.NOT_FOUND:
          error.userMessage = ERROR_MESSAGES.EVENT_NOT_FOUND;
          break;
        case HTTP_STATUS.TOO_MANY_REQUESTS:
          error.userMessage = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
          break;
        case HTTP_STATUS.INTERNAL_ERROR:
          error.userMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
          break;
        default:
          error.userMessage =
            error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      }
    }

    // Retry logic
    if (shouldRetry(error, config.retryCount)) {
      config.retryCount += 1;
      const delay = getRetryDelay(config.retryCount);

      logger.warn(
        `Retrying request (${config.retryCount}/${RETRY_CONFIG.MAX_RETRIES})`,
        {
          url: config.url,
          delay,
        }
      );

      await wait(delay);
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (
  error,
  defaultMessage = ERROR_MESSAGES.UNKNOWN_ERROR
) => {
  if (error.userMessage) {
    return error.userMessage;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  return defaultMessage;
};

/**
 * Helper function to check if error is a network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.message === "Network Error";
};

/**
 * Helper function to check if error is an authentication error
 */
export const isAuthError = (error) => {
  return (
    error.response?.status === HTTP_STATUS.UNAUTHORIZED ||
    error.response?.status === HTTP_STATUS.FORBIDDEN
  );
};

export default apiClient;
export { API_URL };
