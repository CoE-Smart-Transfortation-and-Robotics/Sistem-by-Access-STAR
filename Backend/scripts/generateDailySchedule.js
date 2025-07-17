"use strict";
const { Train, TrainSchedule, ScheduleRoute, sequelize } = require('../models');
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
    const todayDate = jakartaNow.format('YYYY-MM-DD');
    const timestampNow = jakartaNow.toDate();

    // Cek apakah jadwal untuk tanggal besok sudah ada
    const existingSchedule = await TrainSchedule.findOne({
      where: { schedule_date: tomorrowDate },
      transaction: t,
    });

    if (existingSchedule) {
      console.warn(`⚠️ Jadwal untuk tanggal ${tomorrowDate} sudah ada, proses generate dibatalkan.`);
      await t.rollback();
      process.exit(0);
    }

    // Jika tanggal besok sama dengan hari ini (atau lebih kecil), jangan lanjut
    if (tomorrowDate <= todayDate) {
      console.warn(`⚠️ Tanggal generate (${tomorrowDate}) harus lebih besar dari tanggal hari ini (${todayDate}), proses dibatalkan.`);
      await t.rollback();
      process.exit(0);
    }

    const trains = await Train.findAll({ transaction: t });

    for (const train of trains) {
      // Buat jadwal baru
      const schedule = await TrainSchedule.create({
        train_id: train.id,
        schedule_date: tomorrowDate,
        created_at: timestampNow,
        updated_at: timestampNow
      }, { transaction: t });

      // Copy rute dari jadwal terbaru
      const latestSchedule = await TrainSchedule.findOne({
        where: { train_id: train.id },
        order: [['schedule_date', 'DESC']],
        include: [ScheduleRoute],
        transaction: t,
      });

      if (latestSchedule?.ScheduleRoutes?.length) {
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
    }

    await t.commit();
    console.log(`✅ Jadwal dan rute untuk tanggal ${tomorrowDate} berhasil dibuat.`);
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('Gagal generate jadwal:', err);
    process.exit(1);
  }
}

generateScheduleForTomorrow();