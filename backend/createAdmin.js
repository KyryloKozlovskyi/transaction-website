require("dotenv").config();
const { initializeFirebase } = require("./firebase/admin");
const { createAdminUser } = require("./utils/adminSetup");

// Initialize Firebase
initializeFirebase();

const setupAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    console.log("\n=== Firebase Admin Setup ===\n");
    console.log("Instructions:");
    console.log("1. Go to Firebase Console > Authentication");
    console.log("2. Create a user with email:", adminEmail);
    console.log("3. Run this script to grant admin privileges\n");

    await createAdminUser(adminEmail);

    console.log("\n✓ Admin setup complete!");
    console.log("The user can now sign in and access admin features.\n");

    process.exit(0);
  } catch (error) {
    console.error("Error setting up admin:", error);
    process.exit(1);
  }
};

setupAdmin();
