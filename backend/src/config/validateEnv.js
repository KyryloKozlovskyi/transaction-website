const logger = require("../utils/logger");

/**
 * Required environment variables
 */
const requiredEnvVars = ["RESEND_API_KEY", "RESEND_DOMAIN"];

/**
 * Optional environment variables with defaults
 */
const optionalEnvVars = {
  PORT: 5000,
  NODE_ENV: "development",
  LOG_LEVEL: "info",
};

/**
 * Validate environment variables
 */
const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Set defaults for optional variables
  Object.entries(optionalEnvVars).forEach(([varName, defaultValue]) => {
    if (!process.env[varName]) {
      process.env[varName] = String(defaultValue);
      warnings.push(`${varName} not set, using default: ${defaultValue}`);
    }
  });

  // Handle validation results
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((varName) => console.error(`   - ${varName}`));
    console.error("\n💡 Please create a .env file with these variables.");
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Using default values:");
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  logger.info("✅ Environment variables validated successfully");
};

module.exports = { validateEnvironment };
