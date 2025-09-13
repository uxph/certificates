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
      if(filePath.includes("dvo")) continue;


      // delete all first
      await db.collection("workshops_counter").doc().delete();

      console.log("Importing CSV to DB");
      const batch = db.batch();
      jsonArray.forEach((item) => {
        const docRef = db.collection("workshops_counter").doc(); // Change to doc(item.id) if needed
        batch.set(docRef, { ...item, slotsLeft: 30 });
      });

      await batch.commit();
      console.log(`✅ Imported ${jsonArray.length} records from "${file}"`);
    }

    console.log("🎉 All CSV files imported to Firestore collection");
  } catch (err) {
    console.error("❌ Error during import:", err);
  }
}

importAllCsvFiles();
