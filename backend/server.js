// Load environment variables
require("dotenv").config();

// Initialize Firebase Admin
const { initializeFirebase } = require("./firebase/admin");
initializeFirebase();

// Import app
const app = require("./src/app");

// Server port
const port = process.env.SERVER_PORT || 5000;

// Start server
app.listen(port, () => {
  console.log(`✓ Server is running on port ${port}`);
  console.log(`✓ Firebase initialized`);
  console.log(`✓ Ready to accept requests`);
});
