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

class BookingError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

class DateHelper {
  static getJakartaTime() {
    return dayjs().tz('Asia/Jakarta');
  }

  static parseDepartureTime(scheduleDate, departureTime) {
    if (departureTime instanceof Date) {
      return dayjs(departureTime).tz('Asia/Jakarta');
    }
    return dayjs(`${scheduleDate}T${departureTime}`).tz('Asia/Jakarta');
  }

  static isTimeExpired(departureTime) {
    const now = this.getJakartaTime();
    return now.isAfter(departureTime);
  }

  static getTimeDifferenceInMinutes(departureTime, currentTime = new Date()) {
    const departure = new Date(departureTime);
    return (departure - currentTime) / (1000 * 60);
  }
}

class PricingService {
  static CLASS_PRICES = {
    Ekonomi: 25000,
    Bisnis: 40000,
    Eksekutif: 60000,
  };

  static calculatePrice(className, distance) {
    const basePrice = this.CLASS_PRICES[className];
    if (!basePrice) {
      throw new BookingError(`Kelas ${className} tidak dikenali.`);
    }
    return basePrice * distance;
  }
}

class SeatAvailabilityService {
  constructor() {
    this.sequelize = sequelize;
  }

  async checkSeatOverlap(seatId, scheduleId, originStationId, destinationStationId, transaction) {
    const overlapping = await this.sequelize.query(
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
          seat_id: seatId,
          schedule_id: scheduleId,
          origin_station_id: originStationId,
          destination_station_id: destinationStationId,
        },
        type: this.sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    return overlapping.length > 0;
  }

  async getAvailableSeats(scheduleId, scheduleDate, originStationId, destinationStationId) {
    return await this.sequelize.query(
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
          schedule_id: scheduleId,
          schedule_date: scheduleDate,
          origin_station_id: originStationId,
          destination_station_id: destinationStationId,
        },
        type: this.sequelize.QueryTypes.SELECT,
      }
    );
  }
}

class ValidationService {
  static validateBookingRequest(data) {
    const { train_id, schedule_date, origin_station_id, destination_station_id, passengers } = data;

    if (!train_id || !schedule_date || !origin_station_id || !destination_station_id) {
      throw new BookingError("train_id, schedule_date, origin_station_id, dan destination_station_id wajib diisi.");
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      throw new BookingError("Daftar penumpang wajib diisi minimal 1.");
    }

    for (const passenger of passengers) {
      if (!passenger.name || !passenger.nik || !passenger.seat_id) {
        throw new BookingError("Setiap penumpang harus memiliki name, nik, dan seat_id.");
      }
    }
  }

  static validateAvailableSeatsRequest(query) {
    const { train_id, schedule_date, origin_station_id, destination_station_id } = query;

    if (!train_id || !schedule_date || !origin_station_id || !destination_station_id) {
      throw new BookingError("train_id, schedule_date, origin_station_id, dan destination_station_id wajib diisi.");
    }
  }
}

class RouteService {
  static async getStationRoutes(scheduleId, originStationId, destinationStationId, transaction) {
    const [originRoute, destinationRoute] = await Promise.all([
      ScheduleRoute.findOne({
        where: { schedule_id: scheduleId, station_id: originStationId },
        transaction,
      }),
      ScheduleRoute.findOne({
        where: { schedule_id: scheduleId, station_id: destinationStationId },
        transaction,
      })
    ]);

    if (!originRoute || !destinationRoute) {
      throw new BookingError("Stasiun asal/tujuan tidak ditemukan.", 404);
    }

    if (originRoute.station_order >= destinationRoute.station_order) {
      throw new BookingError("Stasiun asal harus sebelum stasiun tujuan.");
    }

    return { originRoute, destinationRoute };
  }
}

class BookingService {
  constructor() {
    this.seatAvailabilityService = new SeatAvailabilityService();
  }

  async validateSchedule(trainId, scheduleDate, transaction) {
    const trainSchedule = await TrainSchedule.findOne({
      where: { train_id: trainId, schedule_date: scheduleDate },
      transaction,
    });

    if (!trainSchedule) {
      throw new BookingError("Jadwal kereta tidak ditemukan.", 404);
    }

    return trainSchedule;
  }

  async validateDepartureTime(scheduleDate, departureTime) {
    const departureDateTime = DateHelper.parseDepartureTime(scheduleDate, departureTime);
    
    if (DateHelper.isTimeExpired(departureDateTime)) {
      throw new BookingError("Booking gagal: waktu keberangkatan sudah lewat.");
    }
  }

  async processPassengerBooking(passengers, scheduleId, originStationId, destinationStationId, distance, transaction) {
    let totalPrice = 0;
    const seatIds = [];

    for (const passenger of passengers) {
      const isOverlapping = await this.seatAvailabilityService.checkSeatOverlap(
        passenger.seat_id, scheduleId, originStationId, destinationStationId, transaction
      );

      if (isOverlapping) {
        throw new BookingError(`Seat ${passenger.seat_id} sudah dibooking.`);
      }

      const seat = await Seat.findByPk(passenger.seat_id, {
        include: { model: Carriage, attributes: ["class"] },
        transaction,
      });

      if (!seat || !seat.Carriage) {
        throw new BookingError(`Seat ${passenger.seat_id} atau carriage tidak ditemukan.`);
      }

      const price = PricingService.calculatePrice(seat.Carriage.class, distance);
      totalPrice += price;
      seatIds.push(passenger.seat_id);
    }

    return { totalPrice, seatIds };
  }

  async createBookingRecord(userId, scheduleId, originStationId, destinationStationId, totalPrice, transaction) {
    const jakartaNow = DateHelper.getJakartaTime();
    
    return await Booking.create({
      user_id: userId,
      schedule_id: scheduleId,
      origin_station_id: originStationId,
      destination_station_id: destinationStationId,
      status: "pending",
      price: totalPrice,
      booking_date: jakartaNow.toDate(),
    }, { transaction });
  }

  async createPassengerRecords(bookingId, passengers, transaction) {
    const passengerPromises = passengers.map(passenger => 
      BookingPassenger.create({
        booking_id: bookingId,
        name: passenger.name,
        nik: passenger.nik,
        seat_id: passenger.seat_id,
      }, { transaction })
    );

    return await Promise.all(passengerPromises);
  }

  async buildBookingResponse(bookingId, originStationId, destinationStationId, seatIds, totalPrice, passengers) {
    const [completeBooking, originStation, destinationStation, seatsInfo] = await Promise.all([
      Booking.findByPk(bookingId, {
        attributes: [
          'id', 'user_id', 'schedule_id', 'origin_station_id', 
          'destination_station_id', 'status', 'price', 'booking_date'
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
      Station.findByPk(originStationId, { attributes: ["id", "station_name"] }),
      Station.findByPk(destinationStationId, { attributes: ["id", "station_name"] }),
      this.getSeatDetails(seatIds)
    ]);

    return {
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
        price_per_person: totalPrice / passengers.length
      }
    };
  }

  async getSeatDetails(seatIds) {
    return await Promise.all(
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
    );
  }

  async validateCancellation(bookingId, userId, transaction) {
    const booking = await Booking.findOne({
      attributes: [
        'id', 'user_id', 'schedule_id', 'origin_station_id', 
        'destination_station_id', 'status', 'price', 'booking_date'
      ],
      where: { id: bookingId, user_id: userId },
      include: [{ 
        model: TrainSchedule,
        attributes: ['id', 'train_id', 'schedule_date']
      }],
      transaction,
    });

    if (!booking) {
      throw new BookingError("Booking tidak ditemukan.", 404);
    }

    if (booking.status === "cancelled") {
      throw new BookingError("Booking ini sudah dibatalkan sebelumnya.");
    }

    return booking;
  }

  async validateCancellationTime(booking, transaction) {
    const originRoute = await ScheduleRoute.findOne({
      where: {
        schedule_id: booking.schedule_id,
        station_id: booking.origin_station_id,
      },
      transaction,
    });

    if (!originRoute || !originRoute.departure_time) {
      throw new BookingError("Waktu keberangkatan tidak tersedia.");
    }

    const scheduleDate = new Date(booking.TrainSchedule.schedule_date);
    const departureTime = new Date(`${scheduleDate.toISOString().split("T")[0]}T${originRoute.departure_time}`);
    const timeDiff = DateHelper.getTimeDifferenceInMinutes(departureTime);

    if (timeDiff < 120) {
      throw new BookingError("Pembatalan hanya diperbolehkan minimal 2 jam sebelum keberangkatan.");
    }
  }
}

class BookingController {
  constructor() {
    this.bookingService = new BookingService();
  }

  async getAvailableSeats(req, res) {
    try {
      ValidationService.validateAvailableSeatsRequest(req.query);
      
      const { train_id, schedule_date, origin_station_id, destination_station_id } = req.query;
      
      const trainSchedule = await this.bookingService.validateSchedule(train_id, schedule_date);
      
      const seats = await this.bookingService.seatAvailabilityService.getAvailableSeats(
        trainSchedule.id, 
        schedule_date, 
        origin_station_id, 
        destination_station_id
      );

      return res.status(200).json(seats);
    } catch (err) {
      console.error("Error getAvailableSeats:", err);
      const statusCode = err instanceof BookingError ? err.statusCode : 500;
      const message = err instanceof BookingError ? err.message : "Gagal mengambil kursi.";
      return res.status(statusCode).json({ message });
    }
  }

  async createBooking(req, res) {
    const transaction = await sequelize.transaction();
    try {
      ValidationService.validateBookingRequest(req.body);

      const {
        train_id, schedule_date, origin_station_id, 
        destination_station_id, passengers
      } = req.body;
      const userId = req.user.id;

      const trainSchedule = await this.bookingService.validateSchedule(train_id, schedule_date, transaction);
      const scheduleId = trainSchedule.id;

      const { originRoute, destinationRoute } = await RouteService.getStationRoutes(
        scheduleId, origin_station_id, destination_station_id, transaction
      );

      await this.bookingService.validateDepartureTime(schedule_date, originRoute.departure_time);

      const distance = destinationRoute.station_order - originRoute.station_order;
      const { totalPrice, seatIds } = await this.bookingService.processPassengerBooking(
        passengers, scheduleId, origin_station_id, destination_station_id, distance, transaction
      );

      const booking = await this.bookingService.createBookingRecord(
        userId, scheduleId, origin_station_id, destination_station_id, totalPrice, transaction
      );

      await this.bookingService.createPassengerRecords(booking.id, passengers, transaction);

      await transaction.commit();

      const responseData = await this.bookingService.buildBookingResponse(
        booking.id, origin_station_id, destination_station_id, seatIds, totalPrice, passengers
      );

      return res.status(201).json({
        message: "Booking berhasil",
        data: responseData
      });

    } catch (err) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error("Error createBooking:", err);
      const statusCode = err instanceof BookingError ? err.statusCode : 400;
      const message = err instanceof BookingError ? err.message : "Gagal booking";
      return res.status(statusCode).json({ message });
    }
  }

  async cancelBooking(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const bookingId = req.params.id;
      const userId = req.user.id;

      const booking = await this.bookingService.validateCancellation(bookingId, userId, transaction);
      await this.bookingService.validateCancellationTime(booking, transaction);

      booking.status = "cancelled";
      await booking.save({ transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Booking berhasil dibatalkan." });
    } catch (err) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error("Error cancelBooking:", err);
      const statusCode = err instanceof BookingError ? err.statusCode : 500;
      const message = err instanceof BookingError ? err.message : "Terjadi kesalahan saat membatalkan booking.";
      return res.status(statusCode).json({ message });
    }
  }

  async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await Booking.findAll({
        attributes: [
          'id', 'user_id', 'schedule_id', 'origin_station_id', 
          'destination_station_id', 'status', 'price', 'booking_date',
          'created_at', 'updated_at'
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
  }
}

const bookingController = new BookingController();
module.exports = {
  getAvailableSeats: bookingController.getAvailableSeats.bind(bookingController),
  createBooking: bookingController.createBooking.bind(bookingController),
  cancelBooking: bookingController.cancelBooking.bind(bookingController),
  getMyBookings: bookingController.getMyBookings.bind(bookingController),
};