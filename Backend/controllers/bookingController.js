"use strict";
const { Booking, Seat, Carriage, TrainSchedule, ScheduleRoute, sequelize } = require("../models");

module.exports = {
  async getAvailableSeats(req, res) {
    try {
      const {
        train_id,
        schedule_date,
        origin_station_id,
        destination_station_id,
      } = req.query;

      if (!train_id || !schedule_date || !origin_station_id || !destination_station_id) {
        return res.status(400).json({
          message: "train_id, schedule_date, origin_station_id, dan destination_station_id wajib diisi.",
        });
      }

      const trainSchedule = await TrainSchedule.findOne({
        where: { train_id, schedule_date },
      });

      if (!trainSchedule) {
        return res.status(404).json({ message: "Jadwal kereta tidak ditemukan." });
      }

      const schedule_id = trainSchedule.id;

      const seats = await sequelize.query(
        `
        SELECT 
          s.id AS seat_id, 
          s.seat_number,
          c.class,
          c.id AS carriage_id,
          t.train_name
        FROM seats s
        JOIN carriages c ON s.carriage_id = c.id
        JOIN trains t ON c.train_id = t.id
        JOIN train_schedules ts ON t.id = ts.train_id
        WHERE ts.id = :schedule_id
          AND ts.schedule_date = :schedule_date
          AND NOT EXISTS (
            SELECT 1
            FROM bookings b
            WHERE b.seat_id = s.id
              AND b.schedule_id = ts.id
              AND b.status = 'confirmed'
              AND (
                (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = :origin_station_id)
                  < (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = b.destination_station_id)
                AND
                (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = :destination_station_id)
                  > (SELECT station_order FROM schedule_routes WHERE schedule_id = ts.id AND station_id = b.origin_station_id)
              )
          )
        ORDER BY 
          CASE 
            WHEN c.class = 'Ekonomi' THEN 1
            WHEN c.class = 'Bisnis' THEN 2
            WHEN c.class = 'Eksekutif' THEN 3
            ELSE 4
          END,
          c.id,
          s.id
        `,
        {
          replacements: {
            schedule_id,
            schedule_date,
            origin_station_id,
            destination_station_id,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return res.status(200).json(seats);
    } catch (err) {
      console.error("Error getAvailableSeats:", err);
      return res.status(500).json({ message: "Gagal mengambil kursi." });
    }
  },

  async createBooking(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const {
        train_id,
        schedule_date,
        origin_station_id,
        destination_station_id,
        passengers,
      } = req.body;

      const user_id = req.user.id;

      const trainSchedule = await TrainSchedule.findOne({
        where: { train_id, schedule_date },
      });

      if (!trainSchedule) {
        throw new Error("TrainSchedule tidak ditemukan untuk kereta & tanggal tersebut.");
      }

      const schedule_id = trainSchedule.id;

      const originRoute = await ScheduleRoute.findOne({
        where: { schedule_id, station_id: origin_station_id },
      });

      const destinationRoute = await ScheduleRoute.findOne({
        where: { schedule_id, station_id: destination_station_id },
      });

      if (!originRoute || !destinationRoute) {
        throw new Error("Stasiun asal atau tujuan tidak ditemukan dalam rute.");
      }

      const distance = Math.abs(
        destinationRoute.station_order - originRoute.station_order
      );

      const bookings = [];

      for (const passenger of passengers) {
        const overlapping = await sequelize.query(
          `
          SELECT 1
          FROM bookings b
          WHERE b.seat_id = :seat_id
            AND b.schedule_id = :schedule_id
            AND b.status = 'confirmed'
            AND (
              (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = :origin_station_id)
                < (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = b.destination_station_id)
              AND
              (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = :destination_station_id)
                > (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = b.origin_station_id)
            )
          LIMIT 1;
          `,
          {
            replacements: {
              seat_id: passenger.seat_id,
              schedule_id,
              origin_station_id,
              destination_station_id,
            },
            type: sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        if (overlapping.length > 0) {
          throw new Error(`Seat ${passenger.seat_id} sudah dibooking di rute konflik.`);
        }

        const seat = await Seat.findByPk(passenger.seat_id, {
          include: {
            model: Carriage,
            attributes: ["class"],
          },
        });

        if (!seat || !seat.Carriage) {
          throw new Error(`Data seat ${passenger.seat_id} atau carriage tidak ditemukan.`);
        }

        const seatClass = seat.Carriage.class;
        const pricePerSegment = {
          Ekonomi: 25000,
          Bisnis: 40000,
          Eksekutif: 60000,
        };

        const segmentPrice = pricePerSegment[seatClass];
        if (!segmentPrice) {
          throw new Error(`Kelas ${seatClass} tidak dikenali.`);
        }

        const totalPrice = segmentPrice * distance;

        const booking = await Booking.create(
          {
            user_id,
            seat_id: passenger.seat_id,
            schedule_id,
            origin_station_id,
            destination_station_id,
            status: "pending",
            price: totalPrice,
            booking_date: new Date(),
          },
          { transaction }
        );

        bookings.push(booking);
      }

      await transaction.commit();
      return res.status(201).json({ message: "Booking berhasil", bookings });
    } catch (err) {
      await transaction.rollback();
      console.error("Error createBooking:", err);
      return res.status(400).json({ message: err.message || "Gagal booking" });
    }
  },
};