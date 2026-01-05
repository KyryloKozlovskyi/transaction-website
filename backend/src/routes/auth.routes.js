const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../../middlewares/firebaseAuth");

router.get("/verify", auth, authController.verifyToken);
router.get("/health", authController.healthCheck);

module.exports = router;
