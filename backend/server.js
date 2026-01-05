// Load environment variables
require("dotenv").config();

// Validate environment variables
const { validateEnvironment } = require("./src/config/validateEnv");
validateEnvironment();

// Initialize logger
const logger = require("./src/utils/logger");

// Initialize Firebase Admin
const { initializeFirebase } = require("./firebase/admin");
initializeFirebase();

// Import app
const app = require("./src/app");

// Server port
const port = process.env.PORT || 5000;

// Start server
const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Firebase initialized`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Ready to accept requests`);
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  gracefulShutdown("UNHANDLED_REJECTION");
});
