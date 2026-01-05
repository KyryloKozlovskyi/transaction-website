module.exports = {
  // Firestore collection names
  COLLECTIONS: {
    EVENTS: "events",
    SUBMISSIONS: "submissions",
    USERS: "users",
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500,
    NO_CONTENT: 204,
  },

  // Error messages
  ERROR_MESSAGES: {
    // Authentication & Authorization
    NO_TOKEN: "No authentication token provided",
    INVALID_TOKEN: "Invalid or expired token",
    ACCESS_DENIED: "Access denied. Admin privileges required.",

    // Events
    EVENT_NOT_FOUND: "Event not found",
    EVENTS_FETCH_ERROR: "Failed to fetch events",
    EVENT_CREATE_ERROR: "Failed to create event",
    EVENT_UPDATE_ERROR: "Failed to update event",
    EVENT_DELETE_ERROR: "Failed to delete event",

    // Submissions
    SUBMISSION_NOT_FOUND: "Submission not found",
    SUBMISSIONS_FETCH_ERROR: "Failed to fetch submissions",
    SUBMISSION_CREATE_ERROR: "Failed to create submission",
    SUBMISSION_UPDATE_ERROR: "Failed to update submission",

    // Validation
    INVALID_EMAIL: "Invalid email address format",
    INVALID_INPUT: "Invalid input data",
    REQUIRED_FIELD: "Required field is missing",

    // Files
    FILE_UPLOAD_ERROR: "File upload failed",
    FILE_DELETE_ERROR: "File deletion failed",
    FILE_NOT_FOUND: "File not found",
    INVALID_FILE_TYPE: "Only PDF files are allowed",
    FILE_TOO_LARGE: "File size exceeds maximum limit",

    // General
    INTERNAL_ERROR: "Internal server error",
    ROUTE_NOT_FOUND: "Route not found",
  },

  // Success messages
  SUCCESS_MESSAGES: {
    EVENT_CREATED: "Event created successfully",
    EVENT_UPDATED: "Event updated successfully",
    EVENT_DELETED: "Event deleted successfully",
    SUBMISSION_CREATED: "Submission created successfully",
    SUBMISSION_UPDATED: "Submission updated successfully",
  },

  // File constraints
  FILE_LIMITS: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["application/pdf"],
    ALLOWED_EXTENSIONS: [".pdf"],
  },

  // Validation rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_COURSE_NAME: 3,
    MAX_COURSE_NAME: 200,
    MIN_VENUE_LENGTH: 3,
    MAX_VENUE_LENGTH: 200,
    MIN_EMAIL_TEXT: 10,
    MIN_PRICE: 0,
  },

  // Submission types
  SUBMISSION_TYPES: {
    PERSON: "person",
    COMPANY: "company",
  },
};
