const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../../middlewares/firebaseAuth");
const { authLimiter } = require("../middlewares/rateLimiter");

// Apply auth rate limiter to authentication routes
router.get("/verify", authLimiter, auth, authController.verifyToken);
router.get("/health", authController.healthCheck);

module.exports = router;
