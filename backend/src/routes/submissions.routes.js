const express = require("express");
const router = express.Router();
const submissionsController = require("../controllers/submissions.controller");
const auth = require("../middlewares/firebaseAuth");
const { upload } = require("../config/multer");
const {
  validate,
  submissionSchema,
  updateSubmissionSchema,
  idParamSchema,
} = require("../middlewares/validation");
const {
  submissionLimiter,
  adminLimiter,
} = require("../middlewares/rateLimiter");

// Public routes - strict rate limiting for submissions
router.post(
  "/",
  submissionLimiter,
  upload.single("file"),
  validate(submissionSchema),
  submissionsController.createSubmission,
);

// Protected admin routes - admin rate limiting
router.get("/", auth, adminLimiter, submissionsController.getAllSubmissions);
router.patch(
  "/:id",
  auth,
  adminLimiter,
  validate(idParamSchema, "params"),
  validate(updateSubmissionSchema),
  submissionsController.updateSubmission,
);
router.get(
  "/:id/file",
  auth,
  adminLimiter,
  validate(idParamSchema, "params"),
  submissionsController.downloadFile,
);

router.delete(
  "/:id",
  auth,
  adminLimiter,
  validate(idParamSchema, "params"),
  submissionsController.deleteSubmission,
);

module.exports = router;
