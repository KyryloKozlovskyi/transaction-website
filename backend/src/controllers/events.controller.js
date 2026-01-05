const { getAdmin } = require("../firebase/admin");
const logger = require("../utils/logger");
const { asyncHandler, AppError } = require("../utils/errorHandler");
const {
  COLLECTIONS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../config/constants");
const {
  mapDocsToArray,
  mapDocToObject,
  getDocumentById,
  deleteDocumentById,
  createDocument,
  updateDocument,
} = require("../utils/firestoreHelpers");

const admin = getAdmin();
const db = admin.firestore();

/**
 * Get all events
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const snapshot = await db
    .collection(COLLECTIONS.EVENTS)
    .orderBy("date", "desc")
    .get();

  const events = mapDocsToArray(snapshot);

  logger.info(`Fetched ${events.length} events`);
  res.status(HTTP_STATUS.OK).json(events);
});

/**
 * Get event by ID
 */
const getEventById = asyncHandler(async (req, res) => {
  const event = await getDocumentById(COLLECTIONS.EVENTS, req.params.id);

  logger.info(`Fetched event: ${req.params.id}`);
  res.status(HTTP_STATUS.OK).json(event);
});

/**
 * Create new event
 */
const createEvent = asyncHandler(async (req, res) => {
  const { courseName, venue, date, price, emailText } = req.body;

  const eventData = {
    courseName,
    venue,
    date: new Date(date),
    price: Number(price),
    emailText,
  };

  const newEvent = await createDocument(COLLECTIONS.EVENTS, eventData);

  logger.info(`Created event: ${newEvent.id} - ${courseName}`);
  res.status(HTTP_STATUS.CREATED).json(newEvent);
});

/**
 * Update event
 */
const updateEvent = asyncHandler(async (req, res) => {
  const { courseName, venue, date, price, emailText } = req.body;

  const updateData = {
    courseName,
    venue,
    date: new Date(date),
    price: Number(price),
    emailText,
  };

  await updateDocument(COLLECTIONS.EVENTS, req.params.id, updateData);

  logger.info(`Updated event: ${req.params.id}`);
  res.status(HTTP_STATUS.NO_CONTENT).end();
});

/**
 * Delete event
 */
const deleteEvent = asyncHandler(async (req, res) => {
  await deleteDocumentById(COLLECTIONS.EVENTS, req.params.id);

  // Delete all submissions associated with the event
  const submissionsSnapshot = await db
    .collection(COLLECTIONS.SUBMISSIONS)
    .where("eventId", "==", req.params.id)
    .get();

  if (!submissionsSnapshot.empty) {
    const batch = db.batch();
    submissionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    logger.info(
      `Deleted ${submissionsSnapshot.size} submissions for event: ${req.params.id}`
    );
  }

  logger.info(`Deleted event: ${req.params.id}`);
  res.status(HTTP_STATUS.NO_CONTENT).end();
});

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
