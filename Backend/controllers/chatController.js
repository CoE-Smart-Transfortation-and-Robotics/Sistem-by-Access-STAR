const db = require('../firebase');
const { User } = require('../models');
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function analyzeUrgency(message, senderRole, receiverRole) {
  if (senderRole !== 'user' || receiverRole !== 'admin') {
    return {
      isUrgent: false,
      confidence: 0.0,
      category: 'non-user-to-admin',
      reason: 'Not user to admin communication'
    };
  }

  try {
    const prompt = `
    Analisis pesan berikut dalam konteks layanan kereta api dan tentukan apakah ini URGENT atau tidak.

    Pesan: "${message}"

    Kriteria URGENT untuk layanan kereta api:
    - Kecelakaan atau insiden keselamatan
    - Kerusakan fasilitas yang mengganggu operasional
    - Masalah kesehatan penumpang yang serius
    - Gangguan jadwal kereta yang signifikan
    - Kehilangan barang berharga atau dokumen penting
    - Masalah keamanan atau tindak kejahatan
    - Kerusakan infrastruktur rel atau stasiun
    - Cuaca ekstrem yang mempengaruhi operasional

    Kriteria TIDAK URGENT:
    - Pertanyaan informasi umum
    - Keluhan kecil tentang pelayanan
    - Permintaan refund rutin
    - Saran atau masukan
    - Pertanyaan jadwal kereta
    - Keluhan makanan atau fasilitas non-kritis

    Respons dalam format JSON:
    {
      "isUrgent": true/false,
      "confidence": 0.0-1.0,
      "category": "kategori masalah",
      "reason": "alasan kenapa urgent/tidak urgent"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const analysisText = response.text;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isUrgent: parsed.isUrgent ?? false,
        confidence: parsed.confidence ?? 0.0,
        category: parsed.category ?? 'unknown',
        reason: parsed.reason ?? 'unknown'
      };
    }

    return {
      isUrgent: analysisText.toLowerCase().includes('urgent'),
      confidence: 0.5,
      category: 'unknown',
      reason: 'AI parsing failed, fallback analysis'
    };

  } catch (error) {
    console.error('AI Analysis Error:', error);
    const urgentKeywords = [
      'darurat', 'emergency', 'kecelakaan', 'accident', 'bahaya', 'danger',
      'rusak', 'broken', 'tidak bisa', 'cannot', 'gagal', 'failed',
      'terjebak', 'stuck', 'hilang', 'lost', 'dicuri', 'stolen',
      'sakit', 'sick', 'pingsan', 'faint', 'terluka', 'injured'
    ];
    const messageToCheck = message.toLowerCase();
    const isUrgent = urgentKeywords.some(keyword => messageToCheck.includes(keyword));

    return {
      isUrgent,
      confidence: isUrgent ? 0.7 : 0.3,
      category: 'fallback_analysis',
      reason: isUrgent ? 'Contains urgent keywords' : 'No urgent keywords detected'
    };
  }
}

function sanitize(obj) {
  return JSON.parse(JSON.stringify(obj));
}

exports.sendChat = async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, message } = req.body;

  if (!receiver_id || !message) {
    return res.status(400).json({ error: 'receiver_id dan message wajib diisi' });
  }

  try {
    const [sender, receiver] = await Promise.all([
      User.findByPk(senderId),
      User.findByPk(receiver_id)
    ]);

    if (!receiver) return res.status(404).json({ error: 'Penerima tidak ditemukan' });
    if (!sender) return res.status(404).json({ error: 'Pengirim tidak ditemukan' });

    const sortedParticipants = [senderId, parseInt(receiver_id)].sort((a, b) => a - b);

    const rawChat = {
      project_id: process.env.PROJECT_ID || 'default',
      sender_id: senderId,
      receiver_id: parseInt(receiver_id),
      message,
      timestamp: new Date(),
      participants: sortedParticipants,
      urgency_analysis: {
        is_urgent: false,
        confidence: 0.0,
        category: 'pending',
        reason: 'Analysis not yet completed',
        analyzed_at: null
      },
      priority_level: null,
      sender_role: sender.role,
      receiver_role: receiver.role
    };

    const chat = sanitize(rawChat);
    const docRef = await db.collection('chats').add(chat);

    analyzeUrgency(message, sender.role, receiver.role).then(async (urgencyAnalysis) => {
      let priorityLevel = null;
      if (urgencyAnalysis.isUrgent) {
        if (urgencyAnalysis.confidence > 0.9) {
          priorityLevel = 'high';
        } else if (urgencyAnalysis.confidence > 0.7) {
          priorityLevel = 'medium';
        } else {
          priorityLevel = 'low';
        }
      }

      const updateData = {
        urgency_analysis: {
          is_urgent: urgencyAnalysis.isUrgent ?? false,
          confidence: urgencyAnalysis.confidence ?? 0.0,
          category: urgencyAnalysis.category ?? 'unknown',
          reason: urgencyAnalysis.reason ?? 'unknown',
          analyzed_at: new Date()
        },
        priority_level: priorityLevel
      };

      await db.collection('chats').doc(docRef.id).update(updateData);

      if (urgencyAnalysis.isUrgent && urgencyAnalysis.confidence > 0.7) {
        await db.collection('urgent_chats').add({
          chat_id: docRef.id,
          ...chat,
          ...updateData
        });

        console.log(`🚨 URGENT MESSAGE DETECTED (ASYNC): ${message.substring(0, 50)}...`);
      }
    }).catch(err => {
      console.error('Async AI Analysis Error:', err);
    });

    return res.status(201).json({
      message: 'Chat berhasil dikirim (analisis menyusul)',
      chat_id: docRef.id
    });

  } catch (error) {
    console.error('Send Chat Error:', error);
    res.status(500).json({ error: 'Gagal mengirim chat' });
  }
};

exports.getChats = async (req, res) => {
  const userId = req.user.id;
  const { with_user_id } = req.query;

  if (!with_user_id) {
    return res.status(400).json({ error: 'with_user_id wajib diisi' });
  }

  try {
    const sortedParticipants = [userId, parseInt(with_user_id)].sort((a, b) => a - b);

    const snapshot = await db.collection('chats')
      .where('project_id', '==', process.env.PROJECT_ID || 'default')
      .where('participants', '==', sortedParticipants)
      .orderBy('timestamp')
      .get();

    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        is_urgent: data.urgency_analysis?.is_urgent ?? false
      };
    });

    return res.status(200).json(messages);
  } catch (err) {
    console.error('Get Chats Error:', err);
    res.status(500).json({ error: 'Gagal mengambil chat' });
  }
};

exports.getUrgentChats = async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak' });
  }

  try {
    const snapshot = await db.collection('urgent_chats')
      .where('project_id', '==', process.env.PROJECT_ID || 'default')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const urgentMessages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        is_urgent: data.urgency_analysis?.is_urgent ?? false
      };
    });

    return res.status(200).json(urgentMessages);
  } catch (error) {
    console.error('Get Urgent Chats Error:', error);
    res.status(500).json({ error: 'Gagal mengambil urgent chats' });
  }
};

exports.getAllUserChats = async (req, res) => {
  const userId = req.user.id;

  try {
    const snapshot = await db.collection('chats')
      .where('project_id', '==', process.env.PROJECT_ID || 'default')
      .where('participants', 'array-contains', userId)
      .orderBy('timestamp', 'desc')
      .get();

    const chatMap = new Map();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const otherUserId = data.sender_id === userId ? data.receiver_id : data.sender_id;

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          id: doc.id,
          ...data,
          is_urgent: data.urgency_analysis?.is_urgent ?? false
        });
      }
    });

    const recentChats = Array.from(chatMap.values());

    return res.status(200).json(recentChats);
  } catch (error) {
    console.error('Get All User Chats Error:', error);
    return res.status(500).json({ error: 'Gagal mengambil daftar chat' });
  }
};