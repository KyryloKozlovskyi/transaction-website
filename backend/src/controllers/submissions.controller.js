const { getAdmin } = require("../firebase/admin");
const emailService = require("../services/email.service");
const storageService = require("../services/storage.service");

const admin = getAdmin();
const db = admin.firestore();

/**
 * Create submission
 */
const createSubmission = async (req, res) => {
  try {
    const { eventId, type, name, email } = req.body;

    // Validate email
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    let fileUrl = null;

    // Upload file to Firebase Storage if provided
    if (req.file) {
      fileUrl = await storageService.uploadFile(req.file);
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("submissions").add(submissionData);

    // Send confirmation email (non-blocking)
    emailService
      .sendConfirmationEmail(email, name, type)
      .catch((err) => console.error("Email error:", err));

    res.status(201).json({
      message: "Submission successful",
      submission: {
        id: docRef.id,
        eventId,
        type,
        name,
        email,
        fileName: req.file?.originalname,
      },
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      message: "Error processing submission",
      error: error.message,
    });
  }
};

/**
 * Get all submissions
 */
const getAllSubmissions = async (req, res) => {
  try {
    const snapshot = await db
      .collection("submissions")
      .orderBy("createdAt", "desc")
      .get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
};

/**
 * Update submission paid status
 */
const updateSubmission = async (req, res) => {
  try {
    const { paid } = req.body;

    await db.collection("submissions").doc(req.params.id).update({
      paid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const doc = await db.collection("submissions").doc(req.params.id).get();
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ message: "Error updating submission" });
  }
};

/**
 * Download submission file
 */
const downloadFile = async (req, res) => {
  try {
    const doc = await db.collection("submissions").doc(req.params.id).get();

    if (!doc.exists || !doc.data().fileUrl) {
      return res.status(404).json({ message: "File not found" });
    }

    // Redirect to the file URL
    res.redirect(doc.data().fileUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
};

module.exports = {
  createSubmission,
  getAllSubmissions,
  updateSubmission,
  downloadFile,
};
