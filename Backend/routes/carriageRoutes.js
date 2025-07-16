const express = require('express');
const router = express.Router();
const controller = require('../controllers/carriageController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Carriages
 *   description: API untuk gerbong kereta
 */

/**
 * @swagger
 * /api/carriages:
 *   get:
 *     summary: Ambil semua gerbong kereta
 *     tags: [Carriages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List gerbong kereta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   train_id:
 *                     type: integer
 *                   carriage_number:
 *                     type: integer
 *                   class:
 *                     type: string
 *                   Train:
 *                     type: object
 *                     properties:
 *                       train_name:
 *                         type: string
 *                       train_code:
 *                         type: string
 *                   Seats:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         seat_number:
 *                           type: string
 */
router.get('/', authenticate, controller.getAllCarriages);

/**
 * @swagger
 * /api/carriages/{id}:
 *   get:
 *     summary: Ambil gerbong berdasarkan ID
 *     tags: [Carriages]
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
 *         description: Detail gerbong kereta
 *       404:
 *         description: Gerbong tidak ditemukan
 */
router.get('/:id', authenticate, controller.getCarriageById);

/**
 * @swagger
 * /api/carriages/train/{trainId}:
 *   get:
 *     summary: Ambil gerbong berdasarkan ID kereta
 *     tags: [Carriages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trainId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List gerbong untuk kereta tertentu
 */
router.get('/train/:trainId', authenticate, controller.getCarriagesByTrainId);

/**
 * @swagger
 * /api/carriages:
 *   post:
 *     summary: Tambah gerbong baru
 *     tags: [Carriages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - train_id
 *               - carriage_number
 *               - class
 *             properties:
 *               train_id:
 *                 type: integer
 *                 example: 1
 *               carriage_number:
 *                 type: integer
 *                 example: 1
 *               class:
 *                 type: string
 *                 example: "Eksekutif"
 *     responses:
 *       201:
 *         description: Gerbong berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 */
router.post('/', authenticate, authorizeRole('admin'), controller.createCarriage);

/**
 * @swagger
 * /api/carriages/{id}:
 *   put:
 *     summary: Update gerbong
 *     tags: [Carriages]
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
 *               train_id:
 *                 type: integer
 *                 example: 1
 *               carriage_number:
 *                 type: integer
 *                 example: 1
 *               class:
 *                 type: string
 *                 example: "Eksekutif"
 *     responses:
 *       200:
 *         description: Gerbong berhasil diperbarui
 *       404:
 *         description: Gerbong tidak ditemukan
 */
router.put('/:id', authenticate, authorizeRole('admin'), controller.updateCarriage);

/**
 * @swagger
 * /api/carriages/{id}:
 *   delete:
 *     summary: Hapus gerbong
 *     tags: [Carriages]
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
 *         description: Gerbong berhasil dihapus
 *       404:
 *         description: Gerbong tidak ditemukan
 */
router.delete('/:id', authenticate, authorizeRole('admin'), controller.deleteCarriage);

module.exports = router;
