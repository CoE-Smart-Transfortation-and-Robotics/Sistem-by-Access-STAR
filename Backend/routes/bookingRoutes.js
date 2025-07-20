"use strict";
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authenticate = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: API untuk booking dan pembatalan tiket kereta api
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AvailableSeat:
 *       type: object
 *       properties:
 *         seat_id:
 *           type: integer
 *           description: ID kursi
 *         seat_number:
 *           type: string
 *           description: Nomor kursi
 *         class:
 *           type: string
 *           enum: [Ekonomi, Bisnis, Eksekutif]
 *           description: Kelas kursi
 *         carriage_id:
 *           type: integer
 *           description: ID gerbong
 *         carriage_number:
 *           type: string
 *           description: Nomor gerbong
 *         train_name:
 *           type: string
 *           description: Nama kereta
 *         is_booked:
 *           type: boolean
 *           description: Status apakah kursi sudah dibooking
 *     
 *     Passenger:
 *       type: object
 *       required:
 *         - seat_id
 *         - name
 *         - nik
 *       properties:
 *         seat_id:
 *           type: integer
 *           description: ID kursi yang dipilih
 *         name:
 *           type: string
 *           description: Nama penumpang
 *         nik:
 *           type: string
 *           description: NIK penumpang
 *     
 *     BookingResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Booking berhasil"
 *         data:
 *           type: object
 *           properties:
 *             booking_id:
 *               type: integer
 *             user_id:
 *               type: integer
 *             status:
 *               type: string
 *               enum: [pending, confirmed, cancelled]
 *             total_price:
 *               type: number
 *             booking_date:
 *               type: string
 *               format: date-time
 *             schedule:
 *               type: object
 *               properties:
 *                 schedule_id:
 *                   type: integer
 *                 schedule_date:
 *                   type: string
 *                   format: date
 *                 train_name:
 *                   type: string
 *                 train_code:
 *                   type: string
 *             route:
 *               type: object
 *               properties:
 *                 origin_station:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 destination_station:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *             passengers:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   nik:
 *                     type: string
 *                   seat:
 *                     type: object
 *                     properties:
 *                       seat_id:
 *                         type: integer
 *                       seat_number:
 *                         type: string
 *                       class:
 *                         type: string
 *                       carriage_number:
 *                         type: string
 *             summary:
 *               type: object
 *               properties:
 *                 passenger_count:
 *                   type: integer
 *                 total_seats:
 *                   type: integer
 *                 price_per_person:
 *                   type: number
 *     
 *     MyBooking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         schedule_id:
 *           type: integer
 *         origin_station_id:
 *           type: integer
 *         destination_station_id:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         price:
 *           type: number
 *         booking_date:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         passengers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nik:
 *                 type: string
 *               seat_id:
 *                 type: integer
 *         TrainSchedule:
 *           type: object
 *           properties:
 *             schedule_date:
 *               type: string
 *               format: date
 *             Train:
 *               type: object
 *               properties:
 *                 train_name:
 *                   type: string
 *                 train_code:
 *                   type: string
 *         OriginStation:
 *           type: object
 *           properties:
 *             station_name:
 *               type: string
 *         DestinationStation:
 *           type: object
 *           properties:
 *             station_name:
 *               type: string
 */

/**
 * @swagger
 * /api/bookings/available-seats:
 *   get:
 *     summary: Lihat kursi yang tersedia
 *     description: Mendapatkan daftar kursi yang tersedia untuk perjalanan tertentu, diurutkan berdasarkan kelas (Ekonomi, Bisnis, Eksekutif). Kursi yang sudah dibooking akan memiliki status is_booked = true.
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: train_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kereta api
 *         example: 1
 *       - in: query
 *         name: schedule_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal jadwal kereta (YYYY-MM-DD)
 *         example: "2024-12-25"
 *       - in: query
 *         name: origin_station_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID stasiun asal
 *         example: 1
 *       - in: query
 *         name: destination_station_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID stasiun tujuan
 *         example: 5
 *     responses:
 *       200:
 *         description: Kursi tersedia berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AvailableSeat'
 *             example:
 *               - seat_id: 1
 *                 seat_number: "1A"
 *                 class: "Ekonomi"
 *                 carriage_id: 1
 *                 carriage_number: "1"
 *                 train_name: "Argo Bromo Anggrek"
 *                 is_booked: false
 *               - seat_id: 2
 *                 seat_number: "1B"
 *                 class: "Ekonomi"
 *                 carriage_id: 1
 *                 carriage_number: "1"
 *                 train_name: "Argo Bromo Anggrek"
 *                 is_booked: true
 *       400:
 *         description: Parameter tidak lengkap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "train_id, schedule_date, origin_station_id, dan destination_station_id wajib diisi."
 *       404:
 *         description: Jadwal tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Jadwal kereta tidak ditemukan."
 *       500:
 *         description: Error internal server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Gagal mengambil kursi."
 */
router.get("/available-seats", bookingController.getAvailableSeats);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Booking kursi kereta
 *     description: |
 *       Membuat booking baru untuk satu atau beberapa penumpang. Sistem akan:
 *       - Mengecek ketersediaan kursi berdasarkan overlap rute perjalanan
 *       - Menghitung harga berdasarkan kelas (Ekonomi: 25.000, Bisnis: 40.000, Eksekutif: 60.000) dan jarak perjalanan
 *       - Memvalidasi bahwa waktu keberangkatan belum lewat
 *       - Menggunakan timezone Asia/Jakarta untuk validasi waktu
 *       - Menyimpan booking dengan status "pending"
 *       
 *       Pricing formula: `(base_price * distance) * jumlah_penumpang`
 *       
 *       Distance dihitung dari selisih station_order antara stasiun asal dan tujuan.
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
 *                 description: ID kereta api
 *                 example: 1
 *               schedule_date:
 *                 type: string
 *                 format: date
 *                 description: Tanggal jadwal kereta (YYYY-MM-DD)
 *                 example: "2024-12-25"
 *               origin_station_id:
 *                 type: integer
 *                 description: ID stasiun asal
 *                 example: 1
 *               destination_station_id:
 *                 type: integer
 *                 description: ID stasiun tujuan
 *                 example: 5
 *               passengers:
 *                 type: array
 *                 description: Daftar penumpang
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/Passenger'
 *                 example:
 *                   - seat_id: 1
 *                     name: "John Doe"
 *                     nik: "1234567890123456"
 *                   - seat_id: 2
 *                     name: "Jane Smith"
 *                     nik: "6543210987654321"
 *     responses:
 *       201:
 *         description: Booking berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *             example:
 *               message: "Booking berhasil"
 *               data:
 *                 booking_id: 1
 *                 user_id: 1
 *                 status: "pending"
 *                 total_price: 150000
 *                 booking_date: "2024-12-20T10:30:00.000Z"
 *                 schedule:
 *                   schedule_id: 1
 *                   schedule_date: "2024-12-25"
 *                   train_name: "Argo Bromo Anggrek"
 *                   train_code: "ABA"
 *                 route:
 *                   origin_station:
 *                     id: 1
 *                     name: "Gambir"
 *                   destination_station:
 *                     id: 5
 *                     name: "Surabaya Gubeng"
 *                 passengers:
 *                   - name: "John Doe"
 *                     nik: "1234567890123456"
 *                     seat:
 *                       seat_id: 1
 *                       seat_number: "1A"
 *                       class: "Ekonomi"
 *                       carriage_number: "1"
 *                   - name: "Jane Smith"
 *                     nik: "6543210987654321"
 *                     seat:
 *                       seat_id: 2
 *                       seat_number: "1B"
 *                       class: "Ekonomi"
 *                       carriage_number: "1"
 *                 summary:
 *                   passenger_count: 2
 *                   total_seats: 2
 *                   price_per_person: 75000
 *       400:
 *         description: Gagal booking (kursi sudah dibooking, data tidak valid, dll)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               seat_taken:
 *                 summary: Kursi sudah dibooking
 *                 value:
 *                   message: "Seat 1 sudah dibooking."
 *               train_not_found:
 *                 summary: Jadwal tidak ditemukan
 *                 value:
 *                   message: "TrainSchedule tidak ditemukan."
 *               station_not_found:
 *                 summary: Stasiun tidak ditemukan
 *                 value:
 *                   message: "Stasiun asal/tujuan tidak ditemukan."
 *               invalid_route:
 *                 summary: Rute tidak valid
 *                 value:
 *                   message: "Stasiun asal harus sebelum stasiun tujuan."
 *               departure_passed:
 *                 summary: Waktu keberangkatan sudah lewat
 *                 value:
 *                   message: "Booking gagal: waktu keberangkatan sudah lewat."
 *               invalid_passengers:
 *                 summary: Data penumpang tidak valid
 *                 value:
 *                   message: "Daftar penumpang wajib diisi minimal 1."
 *               passenger_data_incomplete:
 *                 summary: Data penumpang tidak lengkap
 *                 value:
 *                   message: "Setiap penumpang harus memiliki name, nik, dan seat_id."
 *               seat_not_found:
 *                 summary: Kursi tidak ditemukan
 *                 value:
 *                   message: "Seat 1 atau carriage tidak ditemukan."
 *               unknown_class:
 *                 summary: Kelas tidak dikenali
 *                 value:
 *                   message: "Kelas VIP tidak dikenali."
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Error internal server
 */
router.post("/", authenticate, authorizeRole("user"), bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   delete:
 *     summary: Batalkan booking tiket kereta
 *     description: |
 *       Membatalkan booking yang sudah ada. Pembatalan hanya diperbolehkan minimal 2 jam sebelum waktu keberangkatan.
 *       
 *       Sistem akan:
 *       - Validasi bahwa booking dimiliki oleh user yang sedang login
 *       - Mengecek status booking (tidak bisa membatalkan booking yang sudah cancelled)
 *       - Menghitung waktu keberangkatan berdasarkan schedule_date dan departure_time
 *       - Memastikan minimal 2 jam (120 menit) sebelum keberangkatan
 *       - Mengubah status booking menjadi "cancelled"
 *       
 *       Semua operasi dilakukan dalam database transaction untuk memastikan konsistensi data.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID booking yang ingin dibatalkan
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking berhasil dibatalkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Booking berhasil dibatalkan."
 *       400:
 *         description: Gagal membatalkan booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               already_cancelled:
 *                 summary: Booking sudah dibatalkan
 *                 value:
 *                   message: "Booking ini sudah dibatalkan sebelumnya."
 *               too_late:
 *                 summary: Terlambat untuk membatalkan
 *                 value:
 *                   message: "Pembatalan hanya diperbolehkan minimal 2 jam sebelum keberangkatan."
 *               departure_time_unavailable:
 *                 summary: Waktu keberangkatan tidak tersedia
 *                 value:
 *                   message: "Waktu keberangkatan tidak tersedia."
 *       404:
 *         description: Booking tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Booking tidak ditemukan."
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Error internal server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Terjadi kesalahan saat membatalkan booking."
 */
router.delete("/:id/cancel", authenticate, authorizeRole("user"), bookingController.cancelBooking);

/**
 * @swagger
 * /api/bookings/mine:
 *   get:
 *     summary: Ambil semua booking milik user yang sedang login
 *     description: |
 *       Mendapatkan daftar semua booking yang pernah dibuat oleh user yang sedang login, 
 *       diurutkan berdasarkan tanggal pembuatan terbaru (created_at DESC).
 *       
 *       Response mencakup:
 *       - Detail booking (id, status, harga, tanggal booking)
 *       - Informasi penumpang (nama, NIK, seat_id)
 *       - Detail jadwal kereta (tanggal, nama kereta, kode kereta)
 *       - Informasi stasiun asal dan tujuan
 *       - Timestamp created_at dan updated_at
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar booking user berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MyBooking'
 *             example:
 *               - id: 1
 *                 user_id: 1
 *                 schedule_id: 1
 *                 origin_station_id: 1
 *                 destination_station_id: 5
 *                 status: "confirmed"
 *                 price: 150000
 *                 booking_date: "2024-12-20T10:30:00.000Z"
 *                 created_at: "2024-12-20T10:30:00.000Z"
 *                 updated_at: "2024-12-20T10:30:00.000Z"
 *                 passengers:
 *                   - name: "John Doe"
 *                     nik: "1234567890123456"
 *                     seat_id: 1
 *                   - name: "Jane Smith"
 *                     nik: "6543210987654321"
 *                     seat_id: 2
 *                 TrainSchedule:
 *                   schedule_date: "2024-12-25"
 *                   Train:
 *                     train_name: "Argo Bromo Anggrek"
 *                     train_code: "ABA"
 *                 OriginStation:
 *                   station_name: "Gambir"
 *                 DestinationStation:
 *                   station_name: "Surabaya Gubeng"
 *               - id: 2
 *                 user_id: 1
 *                 schedule_id: 2
 *                 origin_station_id: 2
 *                 destination_station_id: 4
 *                 status: "cancelled"
 *                 price: 75000
 *                 booking_date: "2024-12-19T15:45:00.000Z"
 *                 created_at: "2024-12-19T15:45:00.000Z"
 *                 updated_at: "2024-12-19T16:00:00.000Z"
 *                 passengers:
 *                   - name: "Jane Smith"
 *                     nik: "6543210987654321"
 *                     seat_id: 25
 *                 TrainSchedule:
 *                   schedule_date: "2024-12-24"
 *                   Train:
 *                     train_name: "Bima"
 *                     train_code: "BMA"
 *                 OriginStation:
 *                   station_name: "Yogyakarta"
 *                 DestinationStation:
 *                   station_name: "Solo Balapan"
 *       401:
 *         description: Tidak diotorisasi
 *       500:
 *         description: Error internal server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Gagal mengambil data booking."
 */
router.get("/mine", authenticate, authorizeRole("user"), bookingController.getMyBookings);

/**
 * @swagger
 * /api/bookings/schedules:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Ambil jadwal kereta berdasarkan stasiun asal, tujuan, tanggal, dan kategori
 *     description: Mengembalikan daftar jadwal kereta dari stasiun asal ke tujuan pada tanggal tertentu dan kategori tertentu.
 *     parameters:
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
 *       - in: query
 *         name: schedule_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal keberangkatan (format YYYY-MM-DD)
 *       - in: query
 *         name: train_category
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID kategori kereta (wajib diisi)
 *     responses:
 *       200:
 *         description: Jadwal kereta berhasil ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jadwal kereta berhasil ditemukan.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       schedule_id:
 *                         type: integer
 *                         example: 1
 *                       train:
 *                         type: object
 *                         properties:
 *                           train_id:
 *                             type: integer
 *                             example: 1
 *                           train_name:
 *                             type: string
 *                             example: Lodaya
 *                           train_code:
 *                             type: string
 *                             example: LDY
 *                           category:
 *                             type: string
 *                             example: Antar Kota Antar Provinsi
 *                       route:
 *                         type: object
 *                         properties:
 *                           origin_station:
 *                             type: string
 *                             example: Bandung
 *                           destination_station:
 *                             type: string
 *                             example: Gombong
 *                           distance:
 *                             type: integer
 *                             example: 9
 *                       timing:
 *                         type: object
 *                         properties:
 *                           schedule_date:
 *                             type: string
 *                             format: date
 *                             example: 2025-07-20
 *                           departure_time:
 *                             type: string
 *                             example: "06:30:00"
 *                           arrival_time:
 *                             type: string
 *                             example: "11:42:00"
 *                       seat_classes:
 *                         type: object
 *                         additionalProperties:
 *                           type: integer
 *                         example:
 *                           Eksekutif: 20
 *                           Bisnis: 20
 *                           Ekonomi: 20
 *                       pricing:
 *                         type: object
 *                         description: Harga per orang untuk setiap kelas, dihitung berdasarkan jarak
 *                         additionalProperties:
 *                           type: integer
 *                         example:
 *                           Eksekutif: 540000
 *                           Bisnis: 360000
 *                           Ekonomi: 225000
 *       400:
 *         description: Parameter tidak lengkap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: origin_station_id, destination_station_id, schedule_date, dan train_category wajib diisi.
 *       404:
 *         description: Jadwal tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tidak ada jadwal kereta yang tersedia untuk rute dan tanggal tersebut.
 *       500:
 *         description: Gagal mengambil jadwal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gagal mengambil jadwal kereta.
 */
router.get('/schedules', bookingController.getTrainSchedules);

module.exports = router;