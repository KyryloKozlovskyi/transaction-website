const { getAdmin } = require("../firebase/admin");

// Middleware to verify Firebase ID token and check if user is admin
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.replace("Bearer ", "");

    // Verify the ID token
    const admin = getAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if user has admin claim
    if (!decodedToken.admin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: decodedToken.admin,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = authMiddleware;
