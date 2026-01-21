const { getAdmin } = require("../firebase/admin");
const logger = require("../utils/logger");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../config/constants");
const { AppError } = require("../utils/errorHandler");

// Middleware to verify Firebase ID token and check if user is admin
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.NO_TOKEN });
    }

    const idToken = authHeader.replace("Bearer ", "");

    // Verify the ID token
    const admin = getAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if user has admin claim
    if (!decodedToken.admin) {
      logger.warn(`Non-admin user attempted access: ${decodedToken.email}`);
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ message: ERROR_MESSAGES.ADMIN_ONLY });
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: decodedToken.admin,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: ERROR_MESSAGES.AUTH_FAILED, error: error.message });
  }
};

module.exports = authMiddleware;
