const { getAdmin } = require("../firebase/admin");
const logger = require("../utils/logger");
const { asyncHandler, AppError } = require("../utils/errorHandler");
const {
  COLLECTIONS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../config/constants");
const {
  mapDocsToArray,
  createDocument,
  updateDocument,
  getDocumentById,
} = require("../utils/firestoreHelpers");
const emailService = require("../services/email.service");
const storageService = require("../services/storage.service");

const admin = getAdmin();
const db = admin.firestore();

/**
 * Create submission
 */
const createSubmission = asyncHandler(async (req, res) => {
  const { eventId, type, name, email } = req.body;

  let fileUrl = null;

  // Upload file to Firebase Storage if provided
  if (req.file) {
    fileUrl = await storageService.uploadFile(req.file);
    logger.info(`File uploaded: ${req.file.originalname}`);
  }

  // Save submission to Firestore
  const submissionData = {
    eventId,
    type,
    name,
    email,
    fileUrl,
    fileName: req.file?.originalname || null,
    paid: false,
  };

  const newSubmission = await createDocument(
    COLLECTIONS.SUBMISSIONS,
    submissionData,
  );

  // Send confirmation email (non-blocking)
  emailService
    .sendConfirmationEmail(email, name, type)
    .then(() => logger.info(`Confirmation email sent to: ${email}`))
    .catch((err) => logger.error("Email error:", err));

  logger.info(`Submission created: ${newSubmission.id} - ${name} (${type})`);
  res.status(HTTP_STATUS.CREATED).json({
    message: SUCCESS_MESSAGES.SUBMISSION_CREATED,
    submission: {
      id: newSubmission.id,
      eventId,
      type,
      name,
      email,
      fileName: req.file?.originalname,
    },
  });
});

/**
 * Get all submissions
 */
const getAllSubmissions = asyncHandler(async (req, res) => {
  const snapshot = await db
    .collection(COLLECTIONS.SUBMISSIONS)
    .orderBy("createdAt", "desc")
    .get();

  const submissions = mapDocsToArray(snapshot);

  logger.info(`Fetched ${submissions.length} submissions`);
  res.status(HTTP_STATUS.OK).json(submissions);
});

/**
 * Update submission paid status
 */
const updateSubmission = asyncHandler(async (req, res) => {
  const { paid } = req.body;

  await updateDocument(COLLECTIONS.SUBMISSIONS, req.params.id, { paid });

  const updatedSubmission = await getDocumentById(
    COLLECTIONS.SUBMISSIONS,
    req.params.id,
  );

  logger.info(`Submission updated: ${req.params.id} - paid: ${paid}`);
  res.status(HTTP_STATUS.OK).json(updatedSubmission);
});

/**
 * Download submission file
 */
const downloadFile = asyncHandler(async (req, res) => {
  const submission = await getDocumentById(
    COLLECTIONS.SUBMISSIONS,
    req.params.id,
  );

  if (!submission.fileUrl) {
    throw new AppError(ERROR_MESSAGES.FILE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  try {
    // Get the file from Firebase Storage
    const fileBuffer = await storageService.downloadFile(submission.fileUrl);

    // Set headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${submission.fileName || "document.pdf"}"`,
    );

    logger.info(`File download: ${req.params.id} - ${submission.fileName}`);
    res.send(fileBuffer);
  } catch (error) {
    logger.error(`Error downloading file: ${error.message}`);
    throw new AppError(ERROR_MESSAGES.FILE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
});

/**
 * Delete submission
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await getDocumentById(
    COLLECTIONS.SUBMISSIONS,
    req.params.id,
  );

  // Delete associated file from storage if exists
  if (submission.fileUrl) {
    await storageService.deleteFile(submission.fileUrl);
    logger.info(`File deleted for submission: ${req.params.id}`);
  }

  await db.collection(COLLECTIONS.SUBMISSIONS).doc(req.params.id).delete();

  logger.info(`Submission deleted: ${req.params.id}`);
  res.status(HTTP_STATUS.NO_CONTENT).send();
});

module.exports = {
  createSubmission,
  getAllSubmissions,
  updateSubmission,
  downloadFile,
  deleteSubmission,
};
