const admin = require("firebase-admin");
const csv = require("csvtojson");
const fs = require("fs");
const path = require("path");

// Firebase Admin Initialization
const serviceAccount = require("./serviceAccountKey.json"); // Replace with correct path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const DEFAULT_SLOTS = 30;

// Directory containing CSV files
const csvDirectory = path.join(__dirname, "data/workshops"); // Replace with your directory name

async function importAllCsvFiles() {
  try {
    const files = fs
      .readdirSync(csvDirectory)
      .filter((file) => file.endsWith(".csv"));

    for (const file of files) {
      const filePath = path.join(csvDirectory, file);
      const jsonArray = await csv().fromFile(filePath);
      if(filePath.includes("dvo") || filePath.includes("ceb")) continue;

      console.log(`Importing CSV to DB from ${file}`);

      // For each row, either reset slotsLeft for existing workshopId (and eventSlug if provided),
      // or create a new counter doc with initial slots.
      const batch = db.batch();
      let writes = 0;

      for (const item of jsonArray) {
        const workshopId = item.workshopId || item.id;
        if (!workshopId) {
          console.warn("Skipping row without workshopId/id:", item);
          continue;
        }

        const eventSlug = item.eventSlug || item.event_slug || item.event || undefined;
        const resetSlots = Number.parseInt(item.slotsLeft || item.slots || DEFAULT_SLOTS, 10) || DEFAULT_SLOTS;

        let query = db.collection("workshops_counter").where("workshopId", "==", workshopId);
        if (eventSlug) query = query.where("eventSlug", "==", eventSlug);

        const existing = await query.get();

        if (!existing.empty) {
          existing.forEach((doc) => {
            batch.set(
              doc.ref,
              { slotsLeft: resetSlots, lastReset: new Date() },
              { merge: true }
            );
            writes++;
          });
        } else {
          const docRef = db.collection("workshops_counter").doc();
          batch.set(docRef, {
            ...item,
            workshopId,
            ...(eventSlug ? { eventSlug } : {}),
            slotsLeft: resetSlots,
            createdAt: new Date(),
            lastReset: new Date(),
          });
          writes++;
        }

        // Commit in chunks to avoid batch size limits
        if (writes >= 450) {
          await batch.commit();
          writes = 0;
        }
      }

      if (writes > 0) {
        await batch.commit();
      }

      console.log(`✅ Processed ${jsonArray.length} rows from "${file}"`);
    }

    console.log("🎉 All CSV files imported to Firestore collection");
  } catch (err) {
    console.error("❌ Error during import:", err);
  }
}

importAllCsvFiles();
