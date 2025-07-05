const {
  Train,
  TrainSchedule,
  Carriage,
  Seat,
  ScheduleRoute,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

async function generateScheduleForTomorrow() {
  const t = await sequelize.transaction();

  try {
    const jakartaNow = dayjs().tz('Asia/Jakarta');
    const tomorrowDate = jakartaNow.add(1, 'day').format('YYYY-MM-DD');
    const timestampNow = jakartaNow.toDate();

    const trains = await Train.findAll();

    for (const train of trains) {
      const schedule = await TrainSchedule.create({
        train_id: train.id,
        schedule_date: tomorrowDate,
        created_at: timestampNow,
        updated_at: timestampNow
      }, { transaction: t });
      
      const latestSchedule = await TrainSchedule.findOne({
        where: { train_id: train.id },
        order: [['schedule_date', 'DESC']],
        include: [ScheduleRoute]
      });

      if (latestSchedule && latestSchedule.ScheduleRoutes.length > 0) {
        for (const route of latestSchedule.ScheduleRoutes) {
          await ScheduleRoute.create({
            schedule_id: schedule.id,
            station_id: route.station_id,
            station_order: route.station_order,
            arrival_time: route.arrival_time,
            departure_time: route.departure_time,
            created_at: timestampNow,
            updated_at: timestampNow
          }, { transaction: t });
        }
      }
      
      const carriages = await Carriage.findAll({
        where: { train_id: train.id },
        include: [Seat]
      });

      for (const carriage of carriages) {
        const newCarriage = await Carriage.create({
          train_id: train.id,
          carriage_number: carriage.carriage_number,
          class: carriage.class,
          created_at: timestampNow,
          updated_at: timestampNow
        }, { transaction: t });

        for (const seat of carriage.Seats) {
          await Seat.create({
            carriage_id: newCarriage.id,
            seat_number: seat.seat_number,
            created_at: timestampNow,
            updated_at: timestampNow
          }, { transaction: t });
        }
      }
    }

    await t.commit();
    console.log('Jadwal kereta, rute, gerbong, dan kursi untuk besok berhasil dibuat (Asia/Jakarta).');
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('Gagal generate jadwal:', err);
    process.exit(1);
  }
}

generateScheduleForTomorrow();