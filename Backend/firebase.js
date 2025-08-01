const admin = require('firebase-admin');
const serviceAccount = require('./chat-ai-agent-76597-2e885bc11736.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = db;