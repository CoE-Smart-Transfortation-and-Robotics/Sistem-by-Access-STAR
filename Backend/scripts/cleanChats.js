require('dotenv').config();
const mongoose = require('../mongo');

const PROJECT_ID = process.env.PROJECT_ID || 'default';

const Chat = mongoose.connection.collection('chats');
const UrgentChat = mongoose.connection.collection('urgentchats');

async function deleteByProjectId(collection, name) {
  const result = await collection.deleteMany({ project_id: PROJECT_ID });
  console.log(`🧹 ${result.deletedCount} dokumen dari "${name}" berhasil dihapus`);
  return result.deletedCount;
}

async function deleteChatsByProjectId() {
  console.log(`🚀 Menghapus chat & urgent_chat untuk project_id: ${PROJECT_ID}`);

  try {
    const deletedChats = await deleteByProjectId(Chat, 'chats');
    const deletedUrgentChats = await deleteByProjectId(UrgentChat, 'urgentchats');

    console.log(`✅ Total yang dihapus: ${deletedChats + deletedUrgentChats} dokumen`);
  } catch (err) {
    console.error('🔥 Gagal menghapus data:', err);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

deleteChatsByProjectId();