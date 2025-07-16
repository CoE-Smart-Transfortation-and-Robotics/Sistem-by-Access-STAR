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
 *   description: API untuk melakukan booking kereta dan melihat kursi yang tersedia
 */

/**
 * @swagger
 * /api/bookings/available-seats:
 *   get:
 *     summary: Lihat kursi yang tersedia untuk jadwal kereta
 *     description: Mengambil daftar kursi yang masih tersedia untuk rute dan jadwal tertentu dengan memeriksa konflik booking berdasarkan urutan stasiun.
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: train_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kereta yang akan dicek
 *       - in: query
 *         name: schedule_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal jadwal kereta (format YYYY-MM-DD)
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
 *         description: Daftar kursi yang tersedia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   seat_id:
 *                     type: integer
 *                     example: 101
 *                   seat_number:
 *                     type: string
 *                     example: "A1"
 *                   class:
 *                     type: string
 *                     example: "Ekonomi"
 *                   carriage_id:
 *                     type: integer
 *                     example: 5
 *                   train_name:
 *                     type: string
 *                     example: "Argo Parahyangan"
 *       400:
 *         description: Parameter tidak lengkap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "train_id, schedule_date, origin_station_id, dan destination_station_id wajib diisi."
 *       404:
 *         description: Jadwal kereta tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Jadwal kereta tidak ditemukan."
 *       500:
 *         description: Server error saat mengambil data kursi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gagal mengambil kursi."
 */
router.get('/available-seats', bookingController.getAvailableSeats);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Buat booking tiket kereta
 *     description: Booking kursi untuk penumpang dengan pengecekan kursi yang overlapping pada rute yang sama.
 *     tags: [Bookings]
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
 *               - schedule_date
 *               - origin_station_id
 *               - destination_station_id
 *               - passengers
 *             properties:
 *               train_id:
 *                 type: integer
 *                 example: 1
 *               schedule_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-15"
 *               origin_station_id:
 *                 type: integer
 *                 example: 10
 *               destination_station_id:
 *                 type: integer
 *                 example: 15
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
 *                       example: 5
 *     responses:
 *       201:
 *         description: Booking berhasil dilakukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking berhasil"
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       seat_id:
 *                         type: integer
 *                         example: 5
 *                       schedule_id:
 *                         type: integer
 *                         example: 2
 *                       origin_station_id:
 *                         type: integer
 *                         example: 10
 *                       destination_station_id:
 *                         type: integer
 *                         example: 15
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       price:
 *                         type: integer
 *                         example: 75000
 *                       booking_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-15T10:00:00Z"
 *       400:
 *         description: Gagal melakukan booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seat 5 sudah dibooking di rute konflik."
 *       500:
 *         description: Server error saat melakukan booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gagal booking"
 */
router.post('/', authenticate, authorizeRole('user'), bookingController.createBooking);

module.exports = router;