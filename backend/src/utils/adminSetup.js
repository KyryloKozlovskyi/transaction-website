const { getAdmin } = require("../firebase/admin");

// Set admin custom claim for a user
const setAdminClaim = async (email) => {
  try {
    const admin = getAdmin();
    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`Admin claim set for user: ${email}`);
    return user;
  } catch (error) {
    console.error("Error setting admin claim:", error);
    throw error;
  }
};

// Create an admin user (call this function to set up your first admin)
const createAdminUser = async (email) => {
  try {
    const admin = getAdmin();

    // Check if user exists
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log("User already exists:", email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        console.log(
          "User not found. Please create the user in Firebase Console first."
        );
        console.log("Then run this script to set admin privileges.");
        return null;
      }
      throw error;
    }

    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Admin privileges granted to: ${email}`);

    return user;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};

module.exports = { setAdminClaim, createAdminUser };
