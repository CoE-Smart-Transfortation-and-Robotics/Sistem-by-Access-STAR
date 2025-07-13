const express = require('express');
const router = express.Router();
const controller = require('../controllers/seatController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Seats
 *   description: API untuk kursi kereta
 */

/**
 * @swagger
 * /api/seats:
 *   get:
 *     summary: Ambil semua kursi
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List kursi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   carriage_id:
 *                     type: integer
 *                   seat_number:
 *                     type: string
 *                   Carriage:
 *                     type: object
 *                     properties:
 *                       carriage_number:
 *                         type: integer
 *                       class:
 *                         type: string
 *                       Train:
 *                         type: object
 *                         properties:
 *                           train_name:
 *                             type: string
 *                           train_code:
 *                             type: string
 */
router.get('/', authenticate, controller.getAllSeats);

/**
 * @swagger
 * /api/seats/{id}:
 *   get:
 *     summary: Ambil kursi berdasarkan ID
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail kursi
 *       404:
 *         description: Kursi tidak ditemukan
 */
router.get('/:id', authenticate, controller.getSeatById);

/**
 * @swagger
 * /api/seats/carriage/{carriageId}:
 *   get:
 *     summary: Ambil kursi berdasarkan ID gerbong
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: carriageId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List kursi untuk gerbong tertentu
 */
router.get('/carriage/:carriageId', authenticate, controller.getSeatsByCarriageId);

/**
 * @swagger
 * /api/seats:
 *   post:
 *     summary: Tambah kursi baru
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carriage_id
 *               - seat_number
 *             properties:
 *               carriage_id:
 *                 type: integer
 *                 example: 1
 *               seat_number:
 *                 type: string
 *                 example: "A1"
 *     responses:
 *       201:
 *         description: Kursi berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 */
router.post('/', authenticate, authorizeRole('admin'), controller.createSeat);

/**
 * @swagger
 * /api/seats/bulk:
 *   post:
 *     summary: Tambah beberapa kursi sekaligus
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carriage_id
 *               - seats
 *             properties:
 *               carriage_id:
 *                 type: integer
 *                 example: 1
 *               seats:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     seat_number:
 *                       type: string
 *                       example: "A1"
 *                 example:
 *                   - seat_number: "A1"
 *                   - seat_number: "A2"
 *                   - seat_number: "A3"
 *     responses:
 *       201:
 *         description: Kursi berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 */
router.post('/bulk', authenticate, authorizeRole('admin'), controller.createMultipleSeats);

/**
 * @swagger
 * /api/seats/{id}:
 *   put:
 *     summary: Update kursi
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carriage_id:
 *                 type: integer
 *                 example: 1
 *               seat_number:
 *                 type: string
 *                 example: "A1"
 *     responses:
 *       200:
 *         description: Kursi berhasil diperbarui
 *       404:
 *         description: Kursi tidak ditemukan
 */
router.put('/:id', authenticate, authorizeRole('admin'), controller.updateSeat);

/**
 * @swagger
 * /api/seats/{id}:
 *   delete:
 *     summary: Hapus kursi
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kursi berhasil dihapus
 *       404:
 *         description: Kursi tidak ditemukan
 */
router.delete('/:id', authenticate, authorizeRole('admin'), controller.deleteSeat);

module.exports = router;
