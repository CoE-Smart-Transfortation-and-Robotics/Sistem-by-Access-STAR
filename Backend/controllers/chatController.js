const db = require('../firebase');
const { User } = require('../models');

// Kirim Chat
exports.sendChat = async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, message } = req.body;

  if (!receiver_id || !message) {
    return res.status(400).json({ error: 'receiver_id dan message wajib diisi' });
  }

  try {
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) return res.status(404).json({ error: 'Penerima tidak ditemukan' });

    const sortedParticipants = [senderId, parseInt(receiver_id)].sort((a, b) => a - b);

    const chat = {
      sender_id: senderId,
      receiver_id: parseInt(receiver_id),
      message,
      timestamp: new Date(),
      participants: sortedParticipants
    };

    await db.collection('chats').add(chat);

    return res.status(201).json({ message: 'Chat berhasil dikirim' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengirim chat' });
  }
};

// Ambil chat antara dua user
exports.getChats = async (req, res) => {
  const userId = req.user.id;
  const { with_user_id } = req.query;

  if (!with_user_id) {
    return res.status(400).json({ error: 'with_user_id wajib diisi' });
  }

  try {
    const sortedParticipants = [userId, parseInt(with_user_id)].sort((a, b) => a - b);

    const snapshot = await db.collection('chats')
      .where('participants', '==', sortedParticipants)
      .orderBy('timestamp')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil chat' });
  }
};
