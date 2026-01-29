/*
  Migration script to populate `eventName_lower`, `description_lower`, and `location_lower`
  for all documents in the `events` collection using the Firebase Admin SDK.

  Usage:
    1) Create a Firebase service account JSON and save it locally, e.g. ./serviceAccountKey.json
    2) Run:
       node scripts/migrate_eventname_lower.js ./serviceAccountKey.json

  Notes:
    - This script uses batched writes (500 per batch) and logs progress.
    - Be careful: running multiple times is idempotent (it overwrites the lowercase fields).
*/

const admin = require("firebase-admin");
const path = require("path");

async function main() {
  const serviceAccountPath = process.argv[2];
  if (!serviceAccountPath) {
    console.error("Usage: node scripts/migrate_eventname_lower.js <path-to-service-account.json>");
    process.exit(1);
  }

  const serviceAccount = require(path.resolve(serviceAccountPath));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const eventsRef = db.collection("events");
  const snapshot = await eventsRef.get();
  console.log(`Found ${snapshot.size} documents in 'events' collection`);

  const batchSize = 500;
  let batch = db.batch();
  let ops = 0;
  let batchesRun = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    if (data.eventName) updates.eventName_lower = String(data.eventName).toLowerCase();
    if (data.description) updates.description_lower = String(data.description).toLowerCase();
    if (data.location) updates.location_lower = String(data.location).toLowerCase();

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      ops++;
    }

    if (ops >= batchSize) {
      await batch.commit();
      batchesRun++;
      console.log(`Committed batch #${batchesRun}`);
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
    batchesRun++;
    console.log(`Committed final batch #${batchesRun}`);
  }

  console.log("Migration complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
