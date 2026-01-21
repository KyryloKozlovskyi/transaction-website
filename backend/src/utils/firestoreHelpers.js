const { getAdmin } = require("../firebase/admin");
const { AppError } = require("./errorHandler");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../config/constants");

const admin = getAdmin();
const db = admin.firestore();

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : timestamp;
};

/**
 * Map Firestore document to plain object
 */
const mapDocToObject = (doc) => {
  if (!doc || !doc.exists) {
    return null;
  }

  const data = doc.data();
  const result = {
    id: doc.id,
    ...data,
  };

  // Convert all Timestamp fields
  Object.keys(result).forEach((key) => {
    if (result[key] && typeof result[key].toDate === "function") {
      result[key] = convertTimestamp(result[key]);
    }
  });

  return result;
};

/**
 * Map Firestore document snapshot to array of objects
 */
const mapDocsToArray = (snapshot) => {
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(mapDocToObject).filter(Boolean);
};

/**
 * Get document by ID
 */
const getDocumentById = async (collection, id) => {
  const docRef = db.collection(collection).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return mapDocToObject(doc);
};

/**
 * Delete document by ID
 */
const deleteDocumentById = async (collection, id) => {
  const docRef = db.collection(collection).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  await docRef.delete();
  return { id, deleted: true };
};

/**
 * Create document
 */
const createDocument = async (collection, data) => {
  const docRef = await db.collection(collection).add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...data,
  };
};

/**
 * Update document
 */
const updateDocument = async (collection, id, data) => {
  const docRef = db.collection(collection).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  await docRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id,
    ...data,
  };
};

module.exports = {
  convertTimestamp,
  mapDocToObject,
  mapDocsToArray,
  getDocumentById,
  deleteDocumentById,
  createDocument,
  updateDocument,
};
