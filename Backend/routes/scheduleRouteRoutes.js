"use strict";
const express = require('express');
const router = express.Router();
const controller = require('../controllers/scheduleRouteController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: ScheduleRoutes
 *   description: API untuk rute stasiun dalam jadwal
 */

/**
 * @swagger
 * /api/schedule-routes:
 *   get:
 *     summary: Ambil semua rute jadwal
 *     tags: [ScheduleRoutes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List rute jadwal
 */
router.get('/', authenticate, controller.getAllScheduleRoutes);

/**
 * @swagger
 * /api/schedule-routes/{id}:
 *   get:
 *     summary: Ambil rute berdasarkan ID
 *     tags: [ScheduleRoutes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Detail rute jadwal
 */
router.get('/:id', authenticate, controller.getScheduleRouteById);

/**
 * @swagger
 * /api/schedule-routes:
 *   post:
 *     summary: Tambah rute ke jadwal
 *     tags: [ScheduleRoutes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedule_id
 *               - station_id
 *             properties:
 *               schedule_id:
 *                 type: integer
 *               station_id:
 *                 type: integer
 *               station_order:
 *                 type: integer
 *               arrival_time:
 *                 type: string
 *                 format: time
 *               departure_time:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Rute berhasil ditambahkan
 */
router.post('/', authenticate, authorizeRole('admin'), controller.createScheduleRoute);

/**
 * @swagger
 * /api/schedule-routes/{id}:
 *   put:
 *     summary: Update data rute jadwal
 *     tags: [ScheduleRoutes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule_id:
 *                 type: integer
 *               station_id:
 *                 type: integer
 *               station_order:
 *                 type: integer
 *               arrival_time:
 *                 type: string
 *                 format: time
 *               departure_time:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: Rute berhasil diperbarui
 */
router.put('/:id', authenticate, authorizeRole('admin'), controller.updateScheduleRoute);

/**
 * @swagger
 * /api/schedule-routes/{id}:
 *   delete:
 *     summary: Hapus rute dari jadwal
 *     tags: [ScheduleRoutes]
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
 *         description: Rute berhasil dihapus
 */
router.delete('/:id', authenticate, authorizeRole('admin'), controller.deleteScheduleRoute);

module.exports = router;