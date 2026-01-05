import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Events Collection
export const eventsCollection = collection(db, "events");

export const createEvent = async (eventData) => {
  const docRef = await addDoc(eventsCollection, {
    ...eventData,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...eventData };
};

export const getEvents = async () => {
  const q = query(eventsCollection, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getEvent = async (eventId) => {
  const docRef = doc(db, "events", eventId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateEvent = async (eventId, eventData) => {
  const docRef = doc(db, "events", eventId);
  await updateDoc(docRef, eventData);
};

export const deleteEvent = async (eventId) => {
  const docRef = doc(db, "events", eventId);
  await deleteDoc(docRef);

  // Delete associated submissions
  const submissionsRef = collection(db, "submissions");
  const q = query(submissionsRef, where("eventId", "==", eventId));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Submissions Collection
export const submissionsCollection = collection(db, "submissions");

export const createSubmission = async (submissionData) => {
  const docRef = await addDoc(submissionsCollection, {
    ...submissionData,
    paid: false,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...submissionData };
};

export const getSubmissions = async () => {
  const q = query(submissionsCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getSubmissionsByEvent = async (eventId) => {
  const q = query(submissionsCollection, where("eventId", "==", eventId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateSubmission = async (submissionId, submissionData) => {
  const docRef = doc(db, "submissions", submissionId);
  await updateDoc(docRef, submissionData);
};

export const deleteSubmission = async (submissionId) => {
  const docRef = doc(db, "submissions", submissionId);
  await deleteDoc(docRef);
};
