
"use strict";
const { Train, TrainSchedule, ScheduleRoute, sequelize } = require('../models');
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
    const todayDate = jakartaNow.format('YYYY-MM-DD');
    const timestampNow = jakartaNow.toDate();

    console.log('> Mulai generate jadwal untuk tanggal:', tomorrowDate);

    const existingSchedule = await TrainSchedule.findOne({
      where: { schedule_date: tomorrowDate },
      transaction: t,
    });

    if (existingSchedule) {
      console.warn(`⚠ Jadwal untuk tanggal ${tomorrowDate} sudah ada, proses generate dibatalkan.`);
      await t.rollback();
      process.exit(0);
    }

    if (tomorrowDate <= todayDate) {
      console.warn(`⚠ Tanggal generate (${tomorrowDate}) harus lebih besar dari tanggal hari ini (${todayDate}), proses dibatalkan.`);
      await t.rollback();
      process.exit(0);
    }

    const trains = await Train.findAll({ transaction: t });
    console.log(`> Ditemukan ${trains.length} kereta.`);

    for (const train of trains) {
      console.log(`\n> Memproses kereta: ID=${train.id}, Nama=${train.train_name || '-'}`);

      const schedule = await TrainSchedule.create({
        train_id: train.id,
        schedule_date: tomorrowDate,
        created_at: timestampNow,
        updated_at: timestampNow
      }, { transaction: t });

      console.log(`  Jadwal baru dibuat dengan ID: ${schedule.id}`);

      const latestSchedule = await TrainSchedule.findOne({
        where: {
          train_id: train.id,
          schedule_date: { [Op.lt]: tomorrowDate }
        },
        order: [['schedule_date', 'DESC']],
        include: [{ model: ScheduleRoute, as: 'ScheduleRoutes' }],
        transaction: t,
      });

      if (!latestSchedule) {
        console.warn(`  ⚠ Jadwal terbaru untuk kereta ID=${train.id} tidak ditemukan. Tidak ada rute yang dicopy.`);
        continue;
      }

      console.log(`  Jadwal terbaru ditemukan ID=${latestSchedule.id} tanggal ${latestSchedule.schedule_date}`);

      if (!latestSchedule.ScheduleRoutes || latestSchedule.ScheduleRoutes.length === 0) {
        console.warn(`  ⚠ Tidak ditemukan rute (ScheduleRoutes) pada jadwal ID=${latestSchedule.id}.`);
        continue;
      }

      console.log(`  Ditemukan ${latestSchedule.ScheduleRoutes.length} rute yang akan di-copy:`);

      for (const route of latestSchedule.ScheduleRoutes) {
        console.log(`    - Station ID: ${route.station_id}, Order: ${route.station_order}, Arrival: ${route.arrival_time}, Departure: ${route.departure_time}`);

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

      console.log(`  Semua rute berhasil di-copy untuk jadwal ID: ${schedule.id}`);
    }

    await t.commit();
    console.log(`✅ Jadwal dan rute untuk tanggal ${tomorrowDate} berhasil dibuat.`);
    process.exit(0);

  } catch (err) {
    await t.rollback();
    console.error('❌ Gagal generate jadwal:', err);
    process.exit(1);
  }
}

generateScheduleForTomorrow();

