'use strict';

module.exports = {
  async up(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const now = new Date();

      // 1. Tambah kereta baru
      await queryInterface.bulkInsert('trains', [{
        train_name: 'KRL Commuter Line Rangkasbitung',
        train_code: 'CL-RKS',
        category_id: 2,
        created_at: now,
        updated_at: now,
      }], { transaction: t });

      const [[{ id: trainId }]] = await queryInterface.sequelize.query(
        "SELECT id FROM trains WHERE train_code = 'CL-RKS' LIMIT 1",
        { transaction: t }
      );

      // 2. Tambah 8 gerbong ekonomi
      const carriages = Array.from({ length: 8 }, (_, i) => ({
        train_id: trainId,
        carriage_number: i + 1,
        class: 'Ekonomi AC',
        created_at: now,
        updated_at: now,
      }));

      await queryInterface.bulkInsert('carriages', carriages, { transaction: t });

      const [insertedCarriages] = await queryInterface.sequelize.query(
        `SELECT id, carriage_number FROM carriages WHERE train_id = ${trainId} ORDER BY carriage_number`,
        { transaction: t }
      );

      // 3. Kursi: 10 baris x 4 kolom
      const seats = [];
      const letters = ['A', 'B', 'C', 'D'];
      for (const c of insertedCarriages) {
        for (let row = 1; row <= 10; row++) {
          for (const l of letters) {
            seats.push({
              carriage_id: c.id,
              seat_number: `${row}${l}`,
              created_at: now,
              updated_at: now,
            });
          }
        }
      }
      await queryInterface.bulkInsert('seats', seats, { transaction: t });

      // 4. Jadwal besok
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduleDate = tomorrow.toISOString().slice(0, 10);

      await queryInterface.bulkInsert('train_schedules', [{
        train_id: trainId,
        schedule_date: scheduleDate,
        created_at: now,
        updated_at: now,
      }], { transaction: t });

      const [[{ id: scheduleId }]] = await queryInterface.sequelize.query(
        `SELECT id FROM train_schedules WHERE train_id = ${trainId} AND schedule_date = '${scheduleDate}'`,
        { transaction: t }
      );

      // 5. Rute CL-RKS
      const stationCodes = ['THB', 'SDR', 'SRP', 'PRP', 'RK'];
      const timeMap = {
        THB: { arr: null, dep: '05:45' },
        SDR: { arr: '05:50', dep: '05:52' },
        SRP: { arr: '06:25', dep: '06:28' },
        PRP: { arr: '06:45', dep: '06:47' },
        RK:  { arr: '07:20', dep: null },
      };

      const [stations] = await queryInterface.sequelize.query(
        `SELECT id, station_code
         FROM stations
         WHERE station_code IN (${stationCodes.map(c => `'${c}'`).join(',')})
         ORDER BY FIELD(station_code, ${stationCodes.map(c => `'${c}'`).join(',')})`,
        { transaction: t }
      );

      const scheduleRoutes = stations.map((s, i) => {
        const time = timeMap[s.station_code];
        return {
          schedule_id: scheduleId,
          station_id: s.id,
          station_order: i + 1,
          arrival_time: time.arr ? `${scheduleDate} ${time.arr}:00` : null,
          departure_time: time.dep ? `${scheduleDate} ${time.dep}:00` : null,
          created_at: now,
          updated_at: now,
        };
      });

      await queryInterface.bulkInsert('schedule_routes', scheduleRoutes, { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.sequelize.query(`
        DELETE sr FROM schedule_routes sr
        JOIN train_schedules ts ON sr.schedule_id = ts.id
        JOIN trains tr ON ts.train_id = tr.id
        WHERE tr.train_code = 'CL-RKS'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE ts FROM train_schedules ts
        JOIN trains tr ON ts.train_id = tr.id
        WHERE tr.train_code = 'CL-RKS'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE s FROM seats s
        JOIN carriages c ON s.carriage_id = c.id
        JOIN trains tr ON c.train_id = tr.id
        WHERE tr.train_code = 'CL-RKS'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        DELETE FROM carriages WHERE train_id IN (
          SELECT id FROM trains WHERE train_code = 'CL-RKS'
        )
      `, { transaction: t });

      await queryInterface.bulkDelete('trains', { train_code: 'CL-RKS' }, { transaction: t });
    });
  }
};