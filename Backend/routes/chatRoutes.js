const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "vDqAJ36G6kQRaeJCQ52a"
 *         project_id:
 *           type: string
 *           example: "fatih-project-anjay"
 *         sender_id:
 *           type: integer
 *           example: 1
 *         receiver_id:
 *           type: integer
 *           example: 2
 *         message:
 *           type: string
 *           example: "Pak, permisi ini di kereta ada yang berisik gmn ya?"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-08-01T03:40:54.836Z"
 *         participants:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2]
 *         priority_level:
 *           type: string
 *           nullable: true
 *           enum: [null, "high", "medium", "low"]
 *           example: null
 *         sender_role:
 *           type: string
 *           example: "user"
 *         receiver_role:
 *           type: string
 *           example: "admin"
 *         urgency_analysis:
 *           type: object
 *           properties:
 *             is_urgent:
 *               type: boolean
 *               example: false
 *             confidence:
 *               type: number
 *               example: 0.95
 *             category:
 *               type: string
 *               example: "Keluhan kenyamanan penumpang"
 *             reason:
 *               type: string
 *               example: "Pesan melaporkan adanya gangguan kebisingan yang mengganggu kenyamanan penumpang"
 *             analyzed_at:
 *               type: object
 *               properties:
 *                 _seconds:
 *                   type: integer
 *                   example: 1754019661
 *                 _nanoseconds:
 *                   type: integer
 *                   example: 902000000
 *         is_urgent:
 *           type: boolean
 *           example: false
 *     UrgentChat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "AMeiLGk45TdMAJfitbKT"
 *         chat_id:
 *           type: string
 *           example: "rokmo6HfjqRIaAhzFyZv"
 *         project_id:
 *           type: string
 *           example: "fatih-project-anjay"
 *         sender_id:
 *           type: integer
 *           example: 1
 *         receiver_id:
 *           type: integer
 *           example: 2
 *         message:
 *           type: string
 *           example: "Pak, ada yang mati gmn ini?"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-08-01T03:41:45.391Z"
 *         participants:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2]
 *         urgency_analysis:
 *           type: object
 *           properties:
 *             is_urgent:
 *               type: boolean
 *               example: true
 *             confidence:
 *               type: number
 *               example: 1
 *             category:
 *               type: string
 *               example: "Kecelakaan atau insiden keselamatan"
 *             reason:
 *               type: string
 *               example: "Pesan mengindikasikan adanya kematian yang memerlukan penanganan darurat segera"
 *             analyzed_at:
 *               type: object
 *               properties:
 *                 _seconds:
 *                   type: integer
 *                   example: 1754019710
 *                 _nanoseconds:
 *                   type: integer
 *                   example: 634000000
 *         priority_level:
 *           type: string
 *           example: "high"
 *         sender_role:
 *           type: string
 *           example: "user"
 *         receiver_role:
 *           type: string
 *           example: "admin"
 */

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat antar user dan admin
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Kirim pesan chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - message
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 example: 2
 *               message:
 *                 type: string
 *                 example: "Pak, ada yang pingsan di gerbong 5"
 *     responses:
 *       201:
 *         description: Chat berhasil dikirim (analisis menyusul)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat berhasil dikirim (analisis menyusul)"
 *                 chat_id:
 *                   type: string
 *                   example: "rokmo6HfjqRIaAhzFyZv"
 */
router.post('/', authenticate, chatController.sendChat);

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Ambil semua chat (semua tingkat urgensi)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: with_user_id
 *         schema:
 *           type: integer
 *         required: true
 *         example: 2
 *     responses:
 *       200:
 *         description: Daftar pesan chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 */
router.get('/', authenticate, chatController.getChats);

/**
 * @swagger
 * /api/chat/urgent:
 *   get:
 *     summary: Ambil semua chat yang urgent (hanya admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar chat urgent
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UrgentChat'
 */
router.get('/urgent', authenticate, authorizeRole('admin'), chatController.getUrgentChats);

/**
 * @swagger
 * /api/chat/all:
 *   get:
 *     summary: Ambil chat terakhir dari semua user yang pernah berkomunikasi (seperti daftar chat di WhatsApp)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar chat terakhir per user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       401:
 *         description: Unauthorized (token tidak valid)
 *       500:
 *         description: Gagal mengambil daftar chat
 */
router.get('/all', authenticate, chatController.getAllUserChats);

module.exports = router;