/**
 * Frontend Constants
 * Centralized constants for the React application
 */

// API Endpoints
export const API_ENDPOINTS = {
  EVENTS: "/api/events",
  SUBMISSIONS: "/api/submissions",
  AUTH: "/api/auth",
  AUTH_VERIFY: "/api/auth/verify",
  COMPANY_FORM: "/companyform",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",

  // Authentication Errors
  AUTH_REQUIRED: "Please log in to continue.",
  AUTH_FAILED: "Authentication failed. Please log in again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCESS_DENIED: "You don't have permission to access this resource.",

  // Event Errors
  EVENT_NOT_FOUND: "Event not found.",
  EVENT_LOAD_FAILED: "Failed to load events. Please try again.",
  EVENT_CREATE_FAILED: "Failed to create event. Please try again.",
  EVENT_UPDATE_FAILED: "Failed to update event. Please try again.",
  EVENT_DELETE_FAILED: "Failed to delete event. Please try again.",

  // Submission Errors
  SUBMISSION_FAILED: "Failed to submit. Please try again.",
  SUBMISSION_LOAD_FAILED: "Failed to load submissions. Please try again.",
  FILE_UPLOAD_FAILED: "Failed to upload file. Please try again.",
  FILE_TOO_LARGE: "File size exceeds 5MB limit.",
  FILE_INVALID_TYPE: "Only PDF files are allowed.",

  // Form Validation
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_DATE: "Please enter a valid date.",
  INVALID_PRICE: "Please enter a valid price.",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  EVENT_CREATED: "Event created successfully!",
  EVENT_UPDATED: "Event updated successfully!",
  EVENT_DELETED: "Event deleted successfully!",
  SUBMISSION_CREATED:
    "Submission successful! Check your email for confirmation.",
  SUBMISSION_UPDATED: "Submission updated successfully!",
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully.",
};

// Form Field Constraints
export const FORM_CONSTRAINTS = {
  EVENT_NAME_MAX_LENGTH: 100,
  VENUE_MAX_LENGTH: 200,
  EMAIL_TEXT_MAX_LENGTH: 1000,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 254,
  FILE_MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_FILE_TYPES: ["application/pdf"],
  ALLOWED_FILE_EXTENSIONS: [".pdf"],
};

// Submission Types
export const SUBMISSION_TYPES = {
  PERSON: "person",
  COMPANY: "company",
};

// Loading States
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "userData",
  THEME: "theme",
  LANGUAGE: "language",
};

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_STATUSES: [408, 429, 500, 502, 503, 504], // Status codes to retry
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  INPUT: "YYYY-MM-DD",
  FULL: "MMMM DD, YYYY",
  WITH_TIME: "MMM DD, YYYY HH:mm",
};

// Route Paths
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  EVENTS: "/events",
  SUBMIT: "/submit",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_PANEL: "/admin/panel",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_CREATE_EVENT: "/admin/events/create",
  ADMIN_UPDATE_EVENT: "/admin/events/:id/edit",
  ADMIN_SUBMISSIONS: "/admin/submissions",
  ADMIN_DIAGNOSTICS: "/admin/diagnostics",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Debounce Delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
};

// Feature Flags (for progressive rollout)
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: false,
  ENABLE_NOTIFICATIONS: false,
  ENABLE_ANALYTICS: false,
};
