// scripts/cleanChats.js
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

const serviceAccount = require('../chat-ai-agent-76597-firebase-adminsdk-fbsvc-b0932fddee.json'); // ganti sesuai path kamu

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

const PROJECT_ID = process.env.PROJECT_ID || 'default';

async function deleteChatsByProjectId() {
  const snapshot = await db.collection('chats')
    .where('project_id', '==', PROJECT_ID)
    .get();

  if (snapshot.empty) {
    console.log(`✅ Tidak ada chat untuk project_id: ${PROJECT_ID}`);
    return;
  }

  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
  console.log(`🧹 Chat untuk project_id "${PROJECT_ID}" berhasil dihapus: ${snapshot.size} dokumen`);
}

deleteChatsByProjectId().catch(err => {
  console.error('🔥 Gagal menghapus chat:', err);
  process.exit(1);
});
