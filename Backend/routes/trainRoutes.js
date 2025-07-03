const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Trains
 *   description: API untuk mengelola data kereta
 */

/**
 * @swagger
 * /api/trains:
 *   get:
 *     summary: Ambil semua data kereta
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List kereta
 */
router.get('/', authenticate, trainController.getAllTrains);

/**
 * @swagger
 * /api/trains/{id}:
 *   get:
 *     summary: Ambil kereta berdasarkan ID
 *     tags: [Trains]
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
 *         description: Detail kereta
 */
router.get('/:id', authenticate, trainController.getTrainById);

/**
 * @swagger
 * /api/trains:
 *   post:
 *     summary: Tambahkan kereta baru
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               train_name:
 *                 type: string
 *               train_code:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Kereta berhasil ditambahkan
 */
router.post('/', authenticate, authorizeRole('admin'), trainController.createTrain);

/**
 * @swagger
 * /api/trains/{id}:
 *   put:
 *     summary: Ubah data kereta
 *     tags: [Trains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               train_name:
 *                 type: string
 *               train_code:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Kereta berhasil diperbarui
 */
router.put('/:id', authenticate, authorizeRole('admin'), trainController.updateTrain);

/**
 * @swagger
 * /api/trains/{id}:
 *   delete:
 *     summary: Hapus kereta
 *     tags: [Trains]
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
 *         description: Kereta berhasil dihapus
 */
router.delete('/:id', authenticate, authorizeRole('admin'), trainController.deleteTrain);

module.exports = router;