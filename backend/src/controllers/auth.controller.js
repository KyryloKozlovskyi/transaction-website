/**
 * Verify Firebase token
 */
const verifyToken = (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    user: req.user,
  });
};

/**
 * Health check
 */
const healthCheck = (req, res) => {
  res.json({ status: "ok", service: "transaction-website-api" });
};

module.exports = {
  verifyToken,
  healthCheck,
};
