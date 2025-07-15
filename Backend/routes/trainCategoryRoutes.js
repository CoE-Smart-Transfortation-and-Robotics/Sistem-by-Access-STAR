const express = require('express');
const router = express.Router();
const controller = require('../controllers/trainCategoryController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: TrainCategories
 *   description: API untuk kategori kereta
 */

/**
 * @swagger
 * /api/train-categories:
 *   get:
 *     summary: Ambil semua kategori kereta
 *     tags: [TrainCategories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List kategori kereta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   category_name:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   updated_at:
 *                     type: string
 */
router.get('/', authenticate, controller.getAllTrainCategory);

/**
 * @swagger
 * /api/train-categories/{id}:
 *   get:
 *     summary: Ambil kategori kereta berdasarkan ID
 *     tags: [TrainCategories]
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
 *         description: Detail kategori kereta
 *       404:
 *         description: Kategori kereta tidak ditemukan
 */
router.get('/:id', authenticate, controller.getTrainCategoryById);

/**
 * @swagger
 * /api/train-categories:
 *   post:
 *     summary: Tambah kategori kereta baru
 *     tags: [TrainCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: "Eksekutif"
 *     responses:
 *       201:
 *         description: Kategori kereta berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 */
router.post('/', authenticate, authorizeRole('admin'), controller.createTrainCategory);

/**
 * @swagger
 * /api/train-categories/{id}:
 *   put:
 *     summary: Update kategori kereta
 *     tags: [TrainCategories]
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
 *               category_name:
 *                 type: string
 *                 example: "Eksekutif"
 *     responses:
 *       200:
 *         description: Kategori kereta berhasil diperbarui
 *       404:
 *         description: Kategori kereta tidak ditemukan
 */
router.put('/:id', authenticate, authorizeRole('admin'), controller.updateTrainCategory);

/**
 * @swagger
 * /api/train-categories/{id}:
 *   delete:
 *     summary: Hapus kategori kereta
 *     tags: [TrainCategories]
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
 *         description: Kategori kereta berhasil dihapus
 *       404:
 *         description: Kategori kereta tidak ditemukan
 */
router.delete('/:id', authenticate, authorizeRole('admin'), controller.deleteTrainCategory);

module.exports = router;
