"use strict";
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticate = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking kereta
 */

/**
 * @swagger
 * /api/bookings/available-seats:
 *   get:
 *     summary: Dapatkan kursi yang tersedia untuk jadwal kereta
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: train_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kereta
 *       - in: query
 *         name: schedule_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal jadwal kereta (YYYY-MM-DD)
 *       - in: query
 *         name: origin_station_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID stasiun keberangkatan
 *       - in: query
 *         name: destination_station_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID stasiun tujuan
 *     responses:
 *       200:
 *         description: Daftar kursi tersedia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   seat_id:
 *                     type: integer
 *                   seat_number:
 *                     type: string
 *                   class:
 *                     type: string
 *                   carriage_id:
 *                     type: integer
 *                   train_name:
 *                     type: string
 *       400:
 *         description: Parameter kurang
 *       500:
 *         description: Gagal mengambil kursi
 */
router.get('/available-seats', bookingController.getAvailableSeats);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Buat booking baru
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - train_id
 *               - schedule_date
 *               - origin_station_id
 *               - destination_station_id
 *               - passengers
 *             properties:
 *               user_id:
 *                 type: integer
 *               train_id:
 *                 type: integer
 *               schedule_date:
 *                 type: string
 *                 format: date
 *               origin_station_id:
 *                 type: integer
 *               destination_station_id:
 *                 type: integer
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - seat_id
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Budi"
 *                     nik:
 *                       type: string
 *                       example: "3201010202020202"
 *                     seat_id:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Booking berhasil
 *       400:
 *         description: Gagal booking
 */
router.post('/', authenticate, authorizeRole('user'), bookingController.createBooking);

module.exports = router;