const { getAdmin } = require("../firebase/admin");

const admin = getAdmin();
const db = admin.firestore();

/**
 * Get all events
 */
const getAllEvents = async (req, res) => {
  try {
    const snapshot = await db
      .collection("events")
      .orderBy("date", "desc")
      .get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
    }));

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res) => {
  try {
    const doc = await db.collection("events").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event" });
  }
};

/**
 * Create new event
 */
const createEvent = async (req, res) => {
  try {
    const { courseName, venue, date, price, emailText } = req.body;

    const eventData = {
      courseName,
      venue,
      date: new Date(date),
      price: Number(price),
      emailText,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("events").add(eventData);

    res.status(201).json({ id: docRef.id, ...eventData });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};

/**
 * Update event
 */
const updateEvent = async (req, res) => {
  try {
    const { courseName, venue, date, price, emailText } = req.body;

    const updateData = {
      courseName,
      venue,
      date: new Date(date),
      price: Number(price),
      emailText,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("events").doc(req.params.id).update(updateData);

    res.status(204).end();
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
};

/**
 * Delete event
 */
const deleteEvent = async (req, res) => {
  try {
    await db.collection("events").doc(req.params.id).delete();

    // Delete all submissions associated with the event
    const submissionsSnapshot = await db
      .collection("submissions")
      .where("eventId", "==", req.params.id)
      .get();

    const batch = db.batch();
    submissionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
