Search improvements and migration

What I added

- Client: `src/Components/BookEvent.jsx`
  - Tries server-side prefix search on `eventName_lower` (case-insensitive) using Firestore `orderBy` + `startAt`/`endAt`.
  - Falls back to client-side case-insensitive filtering across `eventName`, `description`, and `location` if server search fails or returns no docs.
  - Shows a simple loading indicator and result count.

- Script: `scripts/migrate_eventname_lower.js`
  - A Node migration (Firebase Admin SDK) that populates `eventName_lower`, `description_lower`, and `location_lower` for all documents in `events`.

Why this helps

- Firestore prefix searches are lexicographic and case-sensitive. By adding `eventName_lower` (precomputed lowercase), you can perform efficient, case-insensitive prefix queries server-side.
- The client-side fallback guarantees search works immediately even before you run the migration.

How to run the migration

1. Create a Firebase service account and download the JSON key. See: https://firebase.google.com/docs/admin/setup
2. Save the JSON somewhere in your project (or a secure location). Example: `./serviceAccountKey.json`.
3. From the project root run:

```powershell
# install firebase-admin if you don't have it
npm install firebase-admin

# run the migration
node scripts/migrate_eventname_lower.js ./serviceAccountKey.json
```

The script will write `eventName_lower`, `description_lower`, and `location_lower` fields for each document.

Make your writes set lowercase fields

To keep future documents searchable server-side, update any codepaths that create/update events to also set `eventName_lower` (and other lower fields) alongside the original values. Example (client pseudocode):

```
await setDoc(docRef, {
  eventName: title,
  eventName_lower: title.toLowerCase(),
  description: desc,
  description_lower: desc.toLowerCase(),
  location: loc,
  location_lower: loc.toLowerCase(),
});
```

Follow-ups you can ask me to do

- I can add the server-side search only (remove fallback) once you confirm you've run the migration.
- I can update any event-creation components in this repo to write the lowercase fields automatically.
- I can add a nicer spinner or highlight matched terms in results.

If you'd like, I can run quick lint/build checks next or update event creation files to include lowercase fields; tell me which you'd prefer.