'use strict';

module.exports = {
  async up(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const now = new Date();

      // 1. Tambah KA Lodaya KA 77
      await queryInterface.bulkInsert('trains', [{
        train_name : 'Lodaya',
        train_code : '77',
        category_id: 1,
        created_at : now,
        updated_at : now
      }], { transaction: t });

      const [[{ id: trainId }]] = await queryInterface.sequelize.query(
        "SELECT id FROM trains WHERE train_name = 'Lodaya' AND train_code = '77' LIMIT 1",
        { transaction: t }
      );

      // 2. Tambah gerbong Ekonomi & Eksekutif
      const classList = ['Ekonomi', 'Eksekutif'];
      const carriagesData = classList.map((cl, idx) => ({
        train_id: trainId,
        carriage_number: idx + 1,
        class: cl,
        created_at: now,
        updated_at: now
      }));
      await queryInterface.bulkInsert('carriages', carriagesData, { transaction: t });

      const [carriages] = await queryInterface.sequelize.query(
        `SELECT id, class FROM carriages WHERE train_id = ${trainId} ORDER BY carriage_number`,
        { transaction: t }
      );

      // 3. Buat kursi
      const seatsData = [];
      for (const carriage of carriages) {
        const isEkonomi = carriage.class === 'Ekonomi';
        const totalRows = isEkonomi ? 18 : 13;

        for (let row = 1; row <= totalRows; row++) {
          for (const seatLetter of ['A', 'B', 'C', 'D']) {
            const seatNumber = `${row}${seatLetter}`;

            // Hapus 1D dan 13A di Eksekutif
            if (!isEkonomi && (seatNumber === '1D' || seatNumber === '13A')) continue;

            seatsData.push({
              carriage_id: carriage.id,
              seat_number: seatNumber,
              created_at: now,
              updated_at: now
            });
          }
        }
      }
      await queryInterface.bulkInsert('seats', seatsData, { transaction: t });

      // 4. Tambah jadwal besok
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduleDate = tomorrow.toISOString().slice(0, 10);

      await queryInterface.bulkInsert('train_schedules', [{
        train_id: trainId,
        schedule_date: scheduleDate,
        created_at: now,
        updated_at: now
      }], { transaction: t });

      const [[{ id: scheduleId }]] = await queryInterface.sequelize.query(
        `SELECT id FROM train_schedules WHERE train_id = ${trainId} AND schedule_date = '${scheduleDate}' LIMIT 1`,
        { transaction: t }
      );

      // 5. Rute Lodaya Solo → Bandung
      const timeMap = {
        SLO : { arr: null, dep: '07:20' },
        KLT : { arr: '07:42', dep: '07:44' },
        YK  : { arr: '08:06', dep: '08:11' },
        WT  : { arr: '08:34', dep: '08:36' },
        KT  : { arr: '09:00', dep: '09:03' },
        KB  : { arr: '09:23', dep: '09:25' },
        GB  : { arr: '09:41', dep: '09:43' },
        KR  : { arr: '10:04', dep: '10:07' },
        MS  : { arr: '10:18', dep: '10:20' },
        SDR : { arr: '10:51', dep: '10:53' },
        BJR : { arr: '11:26', dep: '11:31' },
        CI  : { arr: '11:53', dep: '11:55' },
        TSM : { arr: '12:29', dep: '12:31' },
        CPD : { arr: '13:16', dep: '13:26' },
        KAC : { arr: '15:15', dep: '15:17' },
        BD  : { arr: '15:27', dep: null }
      };

      const [stations] = await queryInterface.sequelize.query(
        `SELECT id, station_code
         FROM stations
         WHERE station_code IN (${Object.keys(timeMap).map(c => `'${c}'`).join(',')})
         ORDER BY FIELD(station_code, ${Object.keys(timeMap).map(c => `'${c}'`).join(',')})`,
        { transaction: t }
      );

      const routesData = stations.map((s, idx) => {
        const tm = timeMap[s.station_code];
        return {
          schedule_id: scheduleId,
          station_id: s.id,
          station_order: idx + 1,
          arrival_time: tm.arr ? `${scheduleDate} ${tm.arr}:00` : null,
          departure_time: tm.dep ? `${scheduleDate} ${tm.dep}:00` : null,
          created_at: now,
          updated_at: now
        };
      });

      await queryInterface.bulkInsert('schedule_routes', routesData, { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async t => {
      await queryInterface.sequelize.query(`
        DELETE sr FROM schedule_routes sr
        JOIN train_schedules ts ON sr.schedule_id = ts.id
        JOIN trains tr ON ts.train_id = tr.id
        WHERE tr.train_name = 'Lodaya' AND tr.train_code = '77'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE s FROM train_schedules s
        JOIN trains tr ON s.train_id = tr.id
        WHERE tr.train_name = 'Lodaya' AND tr.train_code = '77'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE st FROM seats st
        JOIN carriages ca ON st.carriage_id = ca.id
        JOIN trains tr ON ca.train_id = tr.id
        WHERE tr.train_name = 'Lodaya' AND tr.train_code = '77'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE FROM carriages WHERE train_id IN (
          SELECT id FROM trains WHERE train_name = 'Lodaya' AND train_code = '77'
        )
      `, { transaction: t });

      await queryInterface.sequelize.query(
        "DELETE FROM trains WHERE train_name = 'Lodaya' AND train_code = '77'",
        { transaction: t }
      );
    });
  }
};