const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const { corsOptions } = require("./config/cors");
const { handleError, notFoundHandler } = require("./utils/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");
const logger = require("./utils/logger");

// Initialize Express app
const app = express();

// Security Middleware
// Helmet sets various HTTP headers for security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding from different origins
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
  })
);

// CORS
app.use(cors(corsOptions));

// Rate limiting - apply to all routes
app.use(apiLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Request logging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
const eventsRoutes = require("./routes/events.routes");
const submissionsRoutes = require("./routes/submissions.routes");
const authRoutes = require("./routes/auth.routes");

app.use("/api/events", eventsRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/auth", authRoutes);

// Static files
app.get("/companyform", (req, res) => {
  res.sendFile(path.join(__dirname, "../pdfs/companyform.pdf"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "transaction-website-api",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(handleError);

module.exports = app;
