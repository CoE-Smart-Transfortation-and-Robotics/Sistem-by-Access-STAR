'use strict';

module.exports = {
  async up (queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const now = new Date();

      /* 1. Tambah kereta Lodaya */
      await queryInterface.bulkInsert('trains', [{
        train_name : 'Lodaya',
        train_code : 'LDY',
        category_id: 1,
        created_at : now,
        updated_at : now
      }], { transaction: t });

      const [[{ id: trainId }]] = await queryInterface.sequelize.query(
        "SELECT id FROM trains WHERE train_name = 'Lodaya' LIMIT 1",
        { transaction: t }
      );

      /* 2. Tambah 3 gerbong — Ekonomi, Bisnis, Eksekutif */
      const carriagesData = [
        { train_id: trainId, carriage_number: 1, class: 'Ekonomi',   created_at: now, updated_at: now },
        { train_id: trainId, carriage_number: 2, class: 'Bisnis',    created_at: now, updated_at: now },
        { train_id: trainId, carriage_number: 3, class: 'Eksekutif', created_at: now, updated_at: now }
      ];
      await queryInterface.bulkInsert('carriages', carriagesData, { transaction: t });

      const [carriages] = await queryInterface.sequelize.query(
        `SELECT id, carriage_number FROM carriages WHERE train_id = ${trainId} ORDER BY carriage_number`,
        { transaction: t }
      );

      /* 3. Kursi 1A‑5D di tiap gerbong */
      const letters   = ['A','B','C','D'];
      const seatsData = [];
      for (const c of carriages) {
        for (let row = 1; row <= 5; row++) {
          for (const l of letters) {
            seatsData.push({
              carriage_id : c.id,
              seat_number : `${row}${l}`,
              created_at  : now,
              updated_at  : now
            });
          }
        }
      }
      await queryInterface.bulkInsert('seats', seatsData, { transaction: t });

      /* 4. Buat jadwal besok */
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduleDate = tomorrow.toISOString().slice(0, 10); /* YYYY‑MM‑DD */

      await queryInterface.bulkInsert('train_schedules', [{
        train_id     : trainId,
        schedule_date: scheduleDate,
        created_at   : now,
        updated_at   : now
      }], { transaction: t });

      const [[{ id: scheduleId }]] = await queryInterface.sequelize.query(
        `SELECT id FROM train_schedules WHERE train_id = ${trainId} AND schedule_date = '${scheduleDate}' LIMIT 1`,
        { transaction: t }
      );

      /* 5. Rute + waktu real KA Lodaya pagi (Gapeka 2025) */
      const stationCodes = [
        'BD','KAC','CPD','TSM','CI','BJR','SDR','MA',
        'KYA','GB','KM','KTA','WT','YK','KT','SLO'
      ];

      /* Kamus waktu (arrival/departure) dalam HH:MM */
      const timeMap = {
        BD : { arr: null   , dep: '06:30' },
        KAC: { arr: '06:39', dep: '06:41' },
        CPD: { arr: '08:21', dep: '08:31' },
        TSM: { arr: '09:09', dep: '09:11' },
        CI : { arr: '09:31', dep: '09:33' },
        BJR: { arr: '09:54', dep: '09:58' },
        SDR: { arr: '10:22', dep: '10:24' },
        MA : { arr: '11:05', dep: '11:07' },
        KYA: { arr: '11:18', dep: '11:21' },
        GB : { arr: '11:42', dep: '11:44' },
        KM : { arr: '12:00', dep: '12:02' },
        KTA: { arr: '12:22', dep: '12:25' },
        WT : { arr: '12:48', dep: '12:50' },
        YK : { arr: '13:12', dep: '13:17' },
        KT : { arr: '13:38', dep: '13:53' },
        SLO: { arr: '14:18', dep: null    }
      };

      const [stations] = await queryInterface.sequelize.query(
        `SELECT id, station_code
           FROM stations
          WHERE station_code IN (${stationCodes.map(c => `'${c}'`).join(',')})
          ORDER BY FIELD(station_code, ${stationCodes.map(c => `'${c}'`).join(',')})`,
        { transaction: t }
      );

      const routesData = stations.map((s, idx) => {
        const tmap = timeMap[s.station_code] || { arr: null, dep: null };
        return {
          schedule_id   : scheduleId,
          station_id    : s.id,
          station_order : idx + 1,
          arrival_time  : tmap.arr ? `${scheduleDate} ${tmap.arr}:00` : null,
          departure_time: tmap.dep ? `${scheduleDate} ${tmap.dep}:00` : null,
          created_at    : now,
          updated_at    : now
        };
      });

      await queryInterface.bulkInsert('schedule_routes', routesData, { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      /* Hapus semua data yang terkait Lodaya */
      await queryInterface.sequelize.query(`
        DELETE sr FROM schedule_routes sr
        JOIN train_schedules ts ON sr.schedule_id = ts.id
        JOIN trains tr ON ts.train_id = tr.id
        WHERE tr.train_name = 'Lodaya'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE s FROM train_schedules s
        JOIN trains tr ON s.train_id = tr.id
        WHERE tr.train_name = 'Lodaya'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE st FROM seats st
        JOIN carriages ca ON st.carriage_id = ca.id
        JOIN trains tr ON ca.train_id = tr.id
        WHERE tr.train_name = 'Lodaya'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE FROM carriages WHERE train_id IN (
          SELECT id FROM trains WHERE train_name = 'Lodaya'
        )
      `, { transaction: t });

      await queryInterface.sequelize.query(
        "DELETE FROM trains WHERE train_name = 'Lodaya'",
        { transaction: t }
      );
    });
  }
};