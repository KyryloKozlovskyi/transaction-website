// Load environment variables from .env file
require("dotenv").config();

// Server port, default 5000
const port = process.env.SERVER_PORT || 5000;

// Import required modules
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Resend } = require("resend");

// Initialize Firebase Admin
const { initializeFirebase, getAdmin } = require("./firebase/admin");
initializeFirebase();

// Firebase Auth Middleware
const auth = require("./middlewares/firebaseAuth");

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Express app
const app = express();

// Enable CORS for all incoming requests
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Get admin and db references
const admin = getAdmin();
const db = admin.firestore();
const bucket = admin.storage().bucket();

// ===== STATIC FILE ENDPOINTS =====

// Get a locally stored pdf file
app.get("/companyform", (req, res) => {
  res.sendFile(__dirname + "/pdfs/companyform.pdf");
});

// ===== EVENT ENDPOINTS =====

// Create event (protected)
app.post("/api/events", auth, async (req, res) => {
  try {
    const { courseName, venue, date, price, emailText } = req.body;

    const eventData = {
      courseName,
      venue,
      date: new Date(date),
      price: Number(price),
      emailText,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("events").add(eventData);

    res.status(201).json({ id: docRef.id, ...eventData });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const snapshot = await db
      .collection("events")
      .orderBy("date", "desc")
      .get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
    }));

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Get event by id
app.get("/api/events/:id", async (req, res) => {
  try {
    const doc = await db.collection("events").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event" });
  }
});

// Update event (protected)
app.put("/api/events/:id", auth, async (req, res) => {
  try {
    const { courseName, venue, date, price, emailText } = req.body;

    const updateData = {
      courseName,
      venue,
      date: new Date(date),
      price: Number(price),
      emailText,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("events").doc(req.params.id).update(updateData);

    res.status(204).end();
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
});

// Delete event (protected)
app.delete("/api/events/:id", auth, async (req, res) => {
  try {
    await db.collection("events").doc(req.params.id).delete();

    // Delete all submissions associated with the event
    const submissionsSnapshot = await db
      .collection("submissions")
      .where("eventId", "==", req.params.id)
      .get();

    const batch = db.batch();
    submissionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
});

// ===== SUBMISSION ENDPOINTS =====

// Create submission endpoint
app.post("/api/submit", upload.single("file"), async (req, res) => {
  try {
    const { eventId, type, name, email } = req.body;

    // Validate email
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    let fileUrl = null;

    // Upload file to Firebase Storage if provided
    if (req.file) {
      const fileName = `submissions/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      // Make file publicly accessible or generate signed URL
      await file.makePublic();
      fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
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
    try {
      await resend.emails.send({
        from: process.env.RESEND_DOMAIN,
        to: email,
        subject: "Submission Confirmation",
        text: `Dear ${name},\n\nThank you for your submission. We have received your ${type} submission successfully.\n\nBest regards,\nYour Company`,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue even if email fails
    }

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
});

// Get all submissions (protected)
app.get("/api/submissions", auth, async (req, res) => {
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
});

// Update submission paid status (protected)
app.patch("/api/submissions/:id", auth, async (req, res) => {
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
});

// Download file endpoint (protected)
app.get("/api/submissions/:id/file", auth, async (req, res) => {
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
});

// ===== AUTHENTICATION ENDPOINTS =====

// Verify Firebase token
app.get("/api/auth/verify", auth, (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    user: req.user,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "transaction-website-api" });
});

// Start server
app.listen(port, () => {
  console.log(`✓ Server is running on port ${port}`);
  console.log(`✓ Firebase initialized`);
  console.log(`✓ Ready to accept requests`);
});
