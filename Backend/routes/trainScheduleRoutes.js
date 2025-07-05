const express = require('express');
const router = express.Router();
const controller = require('../controllers/trainScheduleController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: TrainSchedules
 *   description: API untuk mengelola jadwal kereta
 */

/**
 * @swagger
 * /api/train-schedules:
 *   get:
 *     summary: Ambil semua jadwal kereta
 *     tags: [TrainSchedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List jadwal
 */
router.get('/', authenticate, controller.getAllSchedules);

/**
 * @swagger
 * /api/train-schedules/{id}:
 *   get:
 *     summary: Ambil jadwal berdasarkan ID
 *     tags: [TrainSchedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail jadwal
 */
router.get('/:id', authenticate, controller.getScheduleById);

/**
 * @swagger
 * /api/train-schedules:
 *   post:
 *     summary: Tambahkan jadwal kereta
 *     tags: [TrainSchedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               train_id:
 *                 type: integer
 *               schedule_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Jadwal berhasil dibuat
 */
router.post('/', authenticate, authorizeRole('admin'), controller.createSchedule);

/**
 * @swagger
 * /api/train-schedules/{id}:
 *   put:
 *     summary: Ubah jadwal kereta
 *     tags: [TrainSchedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               train_id:
 *                 type: integer
 *               schedule_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Jadwal berhasil diubah
 */
router.put('/:id', authenticate, authorizeRole('admin'), controller.updateSchedule);

/**
 * @swagger
 * /api/train-schedules/{id}:
 *   delete:
 *     summary: Hapus jadwal kereta
 *     tags: [TrainSchedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Jadwal berhasil dihapus
 */
router.delete('/:id', authenticate, authorizeRole('admin'), controller.deleteSchedule);

module.exports = router;