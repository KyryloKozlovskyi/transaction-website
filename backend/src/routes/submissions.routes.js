const express = require("express");
const router = express.Router();
const submissionsController = require("../controllers/submissions.controller");
const auth = require("../../middlewares/firebaseAuth");
const { upload } = require("../config/multer");

// Public routes
router.post("/", upload.single("file"), submissionsController.createSubmission);

// Protected routes
router.get("/", auth, submissionsController.getAllSubmissions);
router.patch("/:id", auth, submissionsController.updateSubmission);
router.get("/:id/file", auth, submissionsController.downloadFile);

module.exports = router;
