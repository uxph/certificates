import admin from "firebase-admin";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

const COLLECTION_NAME =
  process.env.WORKSHOP_REGISTRATION_SETTINGS_COLLECTION ||
  "workshop_registration_settings";

/**
 * Fetch all workshop registration settings keyed by event slug.
 * The default state for any slug without an explicit record is `true` (open).
 */
export async function fetchWorkshopRegistrationSettings() {
  const db = getFirebaseAdmin().firestore();
  const snapshot = await db.collection(COLLECTION_NAME).get();

  const result = {};
  snapshot.forEach((doc) => {
    const data = doc.data() || {};
    result[doc.id] = {
      isOpen: typeof data.isOpen === "boolean" ? data.isOpen : true,
      updatedAt: data.updatedAt
        ? data.updatedAt.toDate().toISOString()
        : null,
    };
  });

  return result;
}

/**
 * Determine if workshop registration for a slug is open.
 * Missing records default to open.
 * @param {string} eventSlug
 */
export async function isWorkshopRegistrationOpen(eventSlug) {
  if (!eventSlug) return true;

  const db = getFirebaseAdmin().firestore();
  const doc = await db.collection(COLLECTION_NAME).doc(eventSlug).get();

  if (!doc.exists) return true;
  const data = doc.data() || {};
  return typeof data.isOpen === "boolean" ? data.isOpen : true;
}

/**
 * Upsert workshop registration state for a slug.
 * @param {string} eventSlug
 * @param {boolean} isOpen
 */
export async function setWorkshopRegistrationOpen(eventSlug, isOpen) {
  if (!eventSlug || typeof isOpen !== "boolean") {
    throw new Error("Invalid arguments: eventSlug and isOpen are required.");
  }

  const db = getFirebaseAdmin().firestore();
  const docRef = db.collection(COLLECTION_NAME).doc(eventSlug);

  const payload = {
    isOpen,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await docRef.set(payload, { merge: true });

  const updatedDoc = await docRef.get();
  const data = updatedDoc.data() || {};

  return {
    isOpen: typeof data.isOpen === "boolean" ? data.isOpen : isOpen,
    updatedAt: data.updatedAt
      ? data.updatedAt.toDate().toISOString()
      : null,
  };
}
