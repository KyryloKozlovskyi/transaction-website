const logger = require("../utils/logger");

// Allowed origins based on environment
const getAllowedOrigins = () => {
  const origins = [
    process.env.FRONTEND_URL, // Production frontend URL
    "http://localhost:3000", // Local development
    "http://localhost:5000", // Backend itself
    "http://127.0.0.1:3000",
  ];

  // Add GitHub Codespaces URLs in development
  if (process.env.NODE_ENV === "development") {
    origins.push(/.+\.app\.github\.dev$/); // Allow any GitHub Codespaces URL
  }

  return origins.filter(Boolean); // Remove undefined values
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // In production, reject unauthorized origins
      if (process.env.NODE_ENV === "production") {
        logger.warn(`CORS request blocked from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      } else {
        // In development, allow but log warning
        logger.warn(`CORS request from non-whitelisted origin: ${origin}`);
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  exposedHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400, // 24 hours
};

module.exports = { corsOptions };
