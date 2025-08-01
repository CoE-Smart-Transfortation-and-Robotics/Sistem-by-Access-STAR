const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

const serviceAccount = require('../chat-ai-agent-76597-2e885bc11736.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

const PROJECT_ID = process.env.PROJECT_ID || 'default';

async function deleteCollectionByProjectId(collectionName) {
  const snapshot = await db.collection(collectionName)
    .where('project_id', '==', PROJECT_ID)
    .get();

  if (snapshot.empty) {
    console.log(`✅ Tidak ada data di "${collectionName}" untuk project_id: ${PROJECT_ID}`);
    return 0;
  }

  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`🧹 ${snapshot.size} dokumen di "${collectionName}" berhasil dihapus`);
  return snapshot.size;
}

async function deleteChatsByProjectId() {
  console.log(`🚀 Menghapus chat & urgent_chat untuk project_id: ${PROJECT_ID}`);

  const deletedChats = await deleteCollectionByProjectId('chats');
  const deletedUrgentChats = await deleteCollectionByProjectId('urgent_chats');

  console.log(`✅ Total yang dihapus: ${deletedChats + deletedUrgentChats} dokumen`);
}

deleteChatsByProjectId().catch(err => {
  console.error('🔥 Gagal menghapus data:', err);
  process.exit(1);
});