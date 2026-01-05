const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send confirmation email
 */
const sendConfirmationEmail = async (to, name, type) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_DOMAIN,
      to,
      subject: "Submission Confirmation",
      text: `Dear ${name},\n\nThank you for your submission. We have received your ${type} submission successfully.\n\nBest regards,\nYour Company`,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
};

module.exports = {
  sendConfirmationEmail,
};
