const express = require('express');
const router = express.Router();
const stationsController = require('../controllers/stationController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Stations
 *   description: API untuk mengelola stasiun kereta
 */

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Mendapatkan semua stasiun
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar stasiun berhasil diambil
 */
router.get('/', authenticate, stationsController.getAllStations);

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Mendapatkan detail stasiun berdasarkan ID
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID stasiun
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data stasiun berhasil ditemukan
 *       404:
 *         description: Stasiun tidak ditemukan
 */
router.get('/:id', authenticate, stationsController.getStationById);

/**
 * @swagger
 * /api/stations:
 *   post:
 *     summary: Menambahkan stasiun baru
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               station_name:
 *                 type: string
 *               station_code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stasiun berhasil ditambahkan
 *       403:
 *         description: Forbidden (hanya admin)
 */
router.post('/', authenticate, authorizeRole('admin'), stationsController.createStation);

/**
 * @swagger
 * /api/stations/{id}:
 *   put:
 *     summary: Mengubah data stasiun
 *     tags: [Stations]
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
 *               station_name:
 *                 type: string
 *               station_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data stasiun berhasil diperbarui
 *       403:
 *         description: Forbidden (hanya admin)
 */
router.put('/:id', authenticate, authorizeRole('admin'), stationsController.updateStation);

/**
 * @swagger
 * /api/stations/{id}:
 *   delete:
 *     summary: Menghapus stasiun berdasarkan ID
 *     tags: [Stations]
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
 *         description: Stasiun berhasil dihapus
 *       403:
 *         description: Forbidden (hanya admin)
 */
router.delete('/:id', authenticate, authorizeRole('admin'), stationsController.deleteStation);

module.exports = router;