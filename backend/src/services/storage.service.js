const { getAdmin } = require("../firebase/admin");

const admin = getAdmin();
const bucket = admin.storage().bucket();

/**
 * Upload file to Firebase Storage
 */
const uploadFile = async (file) => {
  const fileName = `submissions/${Date.now()}_${file.originalname}`;
  const fileRef = bucket.file(fileName);

  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });

  // Make file publicly accessible
  await fileRef.makePublic();

  const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return fileUrl;
};

/**
 * Delete file from Firebase Storage
 */
const deleteFile = async (fileUrl) => {
  try {
    const fileName = fileUrl.split("/").pop();
    await bucket.file(`submissions/${fileName}`).delete();
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
