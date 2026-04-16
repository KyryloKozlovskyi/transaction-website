const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(
      __dirname,
      "../../serviceAccountKey.json",
    );

    // Use service account file if it exists, otherwise use environment variables
    if (fs.existsSync(serviceAccountPath)) {
      logger.info("Using service account file for Firebase initialization");
      admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      logger.info("Using environment variables for Firebase initialization");
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Use Application Default Credentials (e.g., on Cloud Run)
      logger.info("Using Application Default Credentials for Firebase initialization");
      admin.initializeApp({
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
  }
  return admin;
};

const getAdmin = () => {
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
  return admin;
};

module.exports = { initializeFirebase, getAdmin, admin };
