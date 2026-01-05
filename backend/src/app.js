const express = require("express");
const cors = require("cors");
const path = require("path");
const { corsOptions } = require("./config/cors");

// Initialize Express app
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors(corsOptions));

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
  res.json({ status: "ok", service: "transaction-website-api" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
