// server/config/firestore.js
const admin = require('firebase-admin');
const serviceAccount = require('../path-to-serviceAccountKey.json'); // Replace with actual path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'https://<your-project-id>.firebaseio.com'
});

const db = admin.firestore();
module.exports = db;
