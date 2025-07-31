// firebase.js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Ganti dengan file service account kamu atau gunakan env var
const serviceAccount = require('./chat-ai-agent-76597-firebase-adminsdk-fbsvc-b0932fddee.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

module.exports = db;