"use strict";
const {
  Booking,
  Station,
  Train,
  Seat,
  Carriage,
  TrainSchedule,
  ScheduleRoute,
  BookingPassenger,
  sequelize,
} = require("../models");

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
            FROM booking_passengers bp
            JOIN bookings b ON bp.booking_id = b.id
            WHERE bp.seat_id = s.id
              AND b.schedule_id = ts.id
              AND b.status IN ('confirmed', 'pending')
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
        throw new Error("TrainSchedule tidak ditemukan.");
      }

      const schedule_id = trainSchedule.id;

      const originRoute = await ScheduleRoute.findOne({
        where: { schedule_id, station_id: origin_station_id },
      });
      const destinationRoute = await ScheduleRoute.findOne({
        where: { schedule_id, station_id: destination_station_id },
      });

      if (!originRoute || !destinationRoute) {
        throw new Error("Stasiun asal/tujuan tidak ditemukan.");
      }

      const distance = Math.abs(destinationRoute.station_order - originRoute.station_order);
      let totalBookingPrice = 0;
      const seatIds = [];

      for (const passenger of passengers) {
        const overlapping = await sequelize.query(
          `
          SELECT 1
          FROM booking_passengers bp
          JOIN bookings b ON bp.booking_id = b.id
          WHERE bp.seat_id = :seat_id
            AND b.schedule_id = :schedule_id
            AND b.status IN ('confirmed', 'pending')
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
          throw new Error(`Seat ${passenger.seat_id} sudah dibooking.`);
        }

        const seat = await Seat.findByPk(passenger.seat_id, {
          include: { model: Carriage, attributes: ["class"] },
        });

        if (!seat || !seat.Carriage) {
          throw new Error(`Seat ${passenger.seat_id} atau carriage tidak ditemukan.`);
        }

        const classPrice = {
          Ekonomi: 25000,
          Bisnis: 40000,
          Eksekutif: 60000,
        }[seat.Carriage.class];

        if (!classPrice) {
          throw new Error(`Kelas ${seat.Carriage.class} tidak dikenali.`);
        }

        totalBookingPrice += classPrice * distance;
        seatIds.push(passenger.seat_id);
      }

      const booking = await Booking.create({
        user_id,
        schedule_id,
        origin_station_id,
        destination_station_id,
        status: "pending",
        price: totalBookingPrice,
        booking_date: new Date(),
      }, { transaction });

      for (const passenger of passengers) {
        await BookingPassenger.create({
          booking_id: booking.id,
          name: passenger.name,
          nik: passenger.nik,
          seat_id: passenger.seat_id,
        }, { transaction });
      }

      await transaction.commit();

      const [completeBooking, originStation, destinationStation, seatsInfo] = await Promise.all([
        Booking.findByPk(booking.id, {
          attributes: [
            'id', 
            'user_id', 
            'schedule_id', 
            'origin_station_id', 
            'destination_station_id', 
            'status', 
            'price', 
            'booking_date'
          ],
          include: [
            {
              model: BookingPassenger,
              as: "passengers",
              attributes: ["name", "nik", "seat_id"],
            },
            {
              model: TrainSchedule,
              attributes: ["schedule_date"],
              include: [{ model: Train, attributes: ["train_name", "train_code"] }]
            }
          ]
        }),
        Station.findByPk(origin_station_id, { attributes: ["id", "station_name"] }),
        Station.findByPk(destination_station_id, { attributes: ["id", "station_name"] }),
        Promise.all(
          seatIds.map(async (seatId) => {
            const seat = await Seat.findByPk(seatId, {
              include: {
                model: Carriage,
                attributes: ["class", "carriage_number"],
              }
            });
            return {
              seat_id: seat.id,
              seat_number: seat.seat_number,
              class: seat.Carriage.class,
              carriage_number: seat.Carriage.carriage_number
            };
          })
        )
      ]);

      return res.status(201).json({
        message: "Booking berhasil",
        data: {
          booking_id: completeBooking.id,
          user_id: completeBooking.user_id,
          status: completeBooking.status,
          total_price: completeBooking.price,
          booking_date: completeBooking.booking_date,
          schedule: {
            schedule_id: completeBooking.schedule_id,
            schedule_date: completeBooking.TrainSchedule.schedule_date,
            train_name: completeBooking.TrainSchedule.Train.train_name,
            train_code: completeBooking.TrainSchedule.Train.train_code,
          },
          route: {
            origin_station: {
              id: originStation.id,
              name: originStation.station_name
            },
            destination_station: {
              id: destinationStation.id,
              name: destinationStation.station_name
            }
          },
          passengers: completeBooking.passengers.map((passenger, index) => ({
            name: passenger.name,
            nik: passenger.nik,
            seat: seatsInfo[index]
          })),
          summary: {
            passenger_count: passengers.length,
            total_seats: seatIds.length,
            price_per_person: totalBookingPrice / passengers.length
          }
        }
      });

    } catch (err) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error("Error createBooking:", err);
      return res.status(400).json({ message: err.message || "Gagal booking" });
    }
  },

  async cancelBooking(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const bookingId = req.params.id;
      const userId = req.user.id;

      const booking = await Booking.findOne({
        attributes: [
          'id', 
          'user_id', 
          'schedule_id', 
          'origin_station_id', 
          'destination_station_id', 
          'status', 
          'price', 
          'booking_date'
        ],
        where: {
          id: bookingId,
          user_id: userId,
        },
        include: [{ 
          model: TrainSchedule,
          attributes: ['id', 'train_id', 'schedule_date']
        }],
        transaction,
      });

      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ message: "Booking tidak ditemukan." });
      }

      if (booking.status === "cancelled") {
        await transaction.rollback();
        return res.status(400).json({ message: "Booking ini sudah dibatalkan sebelumnya." });
      }

      const originRoute = await ScheduleRoute.findOne({
        where: {
          schedule_id: booking.schedule_id,
          station_id: booking.origin_station_id,
        },
        transaction,
      });

      if (!originRoute || !originRoute.departure_time) {
        await transaction.rollback();
        return res.status(400).json({ message: "Waktu keberangkatan tidak tersedia." });
      }

      const scheduleDate = new Date(booking.TrainSchedule.schedule_date);
      const departureTime = new Date(`${scheduleDate.toISOString().split("T")[0]}T${originRoute.departure_time}`);
      const now = new Date();
      const diffInMinutes = (departureTime - now) / (1000 * 60);

      if (diffInMinutes < 120) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Pembatalan hanya diperbolehkan minimal 2 jam sebelum keberangkatan.",
        });
      }

      booking.status = "cancelled";
      await booking.save({ transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Booking berhasil dibatalkan." });
    } catch (err) {
      await transaction.rollback();
      console.error("Error cancelBooking:", err);
      return res.status(500).json({ message: "Terjadi kesalahan saat membatalkan booking." });
    }
  },

  async getAllBookings(req, res) {
    try {
      const bookings = await Booking.findAll({
        attributes: [
          'id', 
          'user_id', 
          'schedule_id', 
          'origin_station_id', 
          'destination_station_id', 
          'status', 
          'price', 
          'booking_date',
          'created_at',
          'updated_at'
        ],
        include: [
          {
            model: BookingPassenger,
            as: "passengers",
            attributes: ["name", "nik", "seat_id"],
          },
          {
            model: TrainSchedule,
            attributes: ["schedule_date"],
            include: [{ model: Train, attributes: ["train_name", "train_code"] }]
          },
          {
            model: Station,
            as: "OriginStation",
            attributes: ["station_name"]
          },
          {
            model: Station,
            as: "DestinationStation", 
            attributes: ["station_name"]
          }
        ],
      });

      return res.status(200).json(bookings);
    } catch (err) {
      console.error("Error getAllBookings:", err);
      return res.status(500).json({ message: "Gagal mengambil data booking." });
    }
  },

  async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await Booking.findAll({
        attributes: [
          'id', 
          'user_id', 
          'schedule_id', 
          'origin_station_id', 
          'destination_station_id', 
          'status', 
          'price', 
          'booking_date',
          'created_at',
          'updated_at'
        ],
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: BookingPassenger,
            as: "passengers",
            attributes: ["name", "nik", "seat_id"],
          },
          {
            model: TrainSchedule,
            attributes: ["schedule_date"],
            include: [{ model: Train, attributes: ["train_name", "train_code"] }]
          },
          {
            model: Station,
            as: "OriginStation",
            attributes: ["station_name"]
          },
          {
            model: Station,
            as: "DestinationStation", 
            attributes: ["station_name"]
          }
        ],
      });

      return res.status(200).json(bookings);
    } catch (err) {
      console.error("Error getMyBookings:", err);
      return res.status(500).json({ message: "Gagal mengambil data booking." });
    }
  },
};