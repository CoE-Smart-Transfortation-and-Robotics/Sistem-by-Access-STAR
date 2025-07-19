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
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

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
          c.carriage_number,
          t.train_name,
          CASE 
            WHEN EXISTS (
              SELECT 1
              FROM booking_passengers bp
              JOIN bookings b ON bp.booking_id = b.id
              WHERE bp.seat_id = s.id
                AND b.schedule_id = :schedule_id
                AND b.status IN ('confirmed', 'pending')
                AND (
                  (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = :origin_station_id)
                    < (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = b.destination_station_id)
                  AND
                  (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = :destination_station_id)
                    > (SELECT station_order FROM schedule_routes WHERE schedule_id = :schedule_id AND station_id = b.origin_station_id)
                )
            ) THEN true ELSE false
          END AS is_booked
        FROM seats s
        JOIN carriages c ON s.carriage_id = c.id
        JOIN trains t ON c.train_id = t.id
        JOIN train_schedules ts ON t.id = ts.train_id
        WHERE ts.id = :schedule_id
          AND ts.schedule_date = :schedule_date
        ORDER BY 
          CASE 
            WHEN c.class = 'Ekonomi' THEN 1
            WHEN c.class = 'Bisnis' THEN 2
            WHEN c.class = 'Eksekutif' THEN 3
            ELSE 4
          END,
          c.carriage_number,
          s.seat_number
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

      if (!Array.isArray(passengers) || passengers.length === 0) {
        throw new Error("Daftar penumpang wajib diisi minimal 1.");
      }
      for (const p of passengers) {
        if (!p.name || !p.nik || !p.seat_id) {
          throw new Error("Setiap penumpang harus memiliki name, nik, dan seat_id.");
        }
      }

      const trainSchedule = await TrainSchedule.findOne({
        where: { train_id, schedule_date },
        transaction,
      });

      if (!trainSchedule) {
        throw new Error("TrainSchedule tidak ditemukan.");
      }

      const schedule_id = trainSchedule.id;

      const originRoute = await ScheduleRoute.findOne({
        where: { schedule_id, station_id: origin_station_id },
        transaction,
      });
      const destinationRoute = await ScheduleRoute.findOne({
        where: { schedule_id, station_id: destination_station_id },
        transaction,
      });

      if (!originRoute || !destinationRoute) {
        throw new Error("Stasiun asal/tujuan tidak ditemukan.");
      }
      
      if (originRoute.station_order >= destinationRoute.station_order) {
        throw new Error("Stasiun asal harus sebelum stasiun tujuan.");
      }

      const jakartaNow = dayjs().tz('Asia/Jakarta');
      let departureTime;
      if (originRoute.departure_time instanceof Date) {
        departureTime = dayjs(originRoute.departure_time).tz('Asia/Jakarta');
      } else {
        departureTime = dayjs(`${schedule_date}T${originRoute.departure_time}`).tz('Asia/Jakarta');
      }

      if (jakartaNow.isAfter(departureTime)) {
        throw new Error("Booking gagal: waktu keberangkatan sudah lewat.");
      }

      const distance = destinationRoute.station_order - originRoute.station_order;
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
          transaction,
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
        booking_date: jakartaNow.toDate(),
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
  
  async getTrainSchedules(req, res) {
    try {
      const {
        origin_station_id,
        destination_station_id,
        schedule_date,
      } = req.query;

      if (!origin_station_id || !destination_station_id || !schedule_date) {
        return res.status(400).json({
          message: "origin_station_id, destination_station_id, dan schedule_date wajib diisi.",
        });
      }

      const schedules = await sequelize.query(
      `
      SELECT 
        ts.id AS schedule_id,
        t.id AS train_id,
        t.train_name,
        t.train_code,
        tc.category_name,
        ts.schedule_date,
        origin_route.departure_time AS origin_departure_time,
        dest_route.arrival_time AS destination_arrival_time,
        origin_station.station_name AS origin_station_name,
        dest_station.station_name AS destination_station_name,
        (dest_route.station_order - origin_route.station_order) AS route_distance,
        GROUP_CONCAT(
          DISTINCT CONCAT(c.class, ':', 
            (SELECT COUNT(*) FROM seats s WHERE s.carriage_id = c.id)
          ) SEPARATOR ','
        ) AS available_classes
      FROM train_schedules ts
      JOIN trains t ON ts.train_id = t.id
      LEFT JOIN train_categories tc ON t.category_id = tc.id
      JOIN schedule_routes origin_route ON ts.id = origin_route.schedule_id 
        AND origin_route.station_id = :origin_station_id
      JOIN schedule_routes dest_route ON ts.id = dest_route.schedule_id 
        AND dest_route.station_id = :destination_station_id
      JOIN stations origin_station ON origin_route.station_id = origin_station.id
      JOIN stations dest_station ON dest_route.station_id = dest_station.id
      JOIN carriages c ON t.id = c.train_id
      WHERE ts.schedule_date = :schedule_date
        AND origin_route.station_order < dest_route.station_order
        AND origin_route.departure_time IS NOT NULL
      GROUP BY 
        ts.id, 
        t.id, 
        t.train_name,
        t.train_code,
        tc.category_name,
        ts.schedule_date,
        origin_route.departure_time, 
        dest_route.arrival_time,
        origin_station.station_name,
        dest_station.station_name,
        dest_route.station_order,
        origin_route.station_order
      ORDER BY origin_route.departure_time ASC
      `,
        {
          replacements: {
            origin_station_id,
            destination_station_id,
            schedule_date,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (schedules.length === 0) {
        return res.status(404).json({
          message: "Tidak ada jadwal kereta yang tersedia untuk rute dan tanggal tersebut.",
        });
      }

      // Format hasil untuk response yang lebih clean
      const formattedSchedules = schedules.map(schedule => {
        const classes = {};
        if (schedule.available_classes) {
          schedule.available_classes.split(',').forEach(classInfo => {
            const [className, seatCount] = classInfo.split(':');
            classes[className] = parseInt(seatCount);
          });
        }

        return {
          schedule_id: schedule.schedule_id,
          train: {
            train_id: schedule.train_id,
            train_name: schedule.train_name,
            train_code: schedule.train_code,
            category: schedule.category_name,
          },
          route: {
            origin_station: schedule.origin_station_name,
            destination_station: schedule.destination_station_name,
            distance: schedule.route_distance,
          },
          timing: {
            schedule_date: schedule.schedule_date,
            departure_time: schedule.origin_departure_time,
            arrival_time: schedule.destination_arrival_time,
          },
          seat_classes: classes,
        };
      });

      return res.status(200).json({
        message: "Jadwal kereta berhasil ditemukan.",
        data: formattedSchedules,
      });
    } catch (err) {
      console.error("Error getTrainSchedules:", err);
      return res.status(500).json({ message: "Gagal mengambil jadwal kereta." });
    }
  },
};