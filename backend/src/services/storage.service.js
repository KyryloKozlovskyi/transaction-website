const { getAdmin } = require("../firebase/admin");
const logger = require("../utils/logger");

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
  logger.info(`File uploaded to storage: ${fileName}`);
  return fileUrl;
};

/**
 * Delete file from Firebase Storage
 */
const deleteFile = async (fileUrl) => {
  try {
    const fileName = fileUrl.split("/").pop();
    await bucket.file(`submissions/${fileName}`).delete();
    logger.info(`File deleted from storage: ${fileName}`);
  } catch (error) {
    logger.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Download file from Firebase Storage
 */
const downloadFile = async (fileUrl) => {
  try {
    // Extract the file path from the URL
    const urlParts = fileUrl.split(`${bucket.name}/`);
    if (urlParts.length < 2) {
      throw new Error("Invalid file URL");
    }
    const filePath = urlParts[1];

    const fileRef = bucket.file(filePath);
    const [fileBuffer] = await fileRef.download();

    logger.info(`File downloaded from storage: ${filePath}`);
    return fileBuffer;
  } catch (error) {
    logger.error("Error downloading file:", error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  downloadFile,
};
