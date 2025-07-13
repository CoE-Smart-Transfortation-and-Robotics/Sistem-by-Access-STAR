'use strict';

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('stations', [
      { station_name: 'Bandung',        station_code: 'BD',  created_at: now, updated_at: now },
      { station_name: 'Kiaracondong',   station_code: 'KAC', created_at: now, updated_at: now },
      { station_name: 'Cipeundeuy',     station_code: 'CPD', created_at: now, updated_at: now },
      { station_name: 'Tasikmalaya',    station_code: 'TSM', created_at: now, updated_at: now },
      { station_name: 'Ciamis',         station_code: 'CI',  created_at: now, updated_at: now },
      { station_name: 'Banjar',         station_code: 'BJR', created_at: now, updated_at: now },
      { station_name: 'Sidareja',       station_code: 'SDR', created_at: now, updated_at: now },
      { station_name: 'Maos',           station_code: 'MA',  created_at: now, updated_at: now },
      { station_name: 'Kroya',          station_code: 'KYA', created_at: now, updated_at: now },
      { station_name: 'Gombong',        station_code: 'GB',  created_at: now, updated_at: now },
      { station_name: 'Kebumen',        station_code: 'KM',  created_at: now, updated_at: now },
      { station_name: 'Kutoarjo',       station_code: 'KTA', created_at: now, updated_at: now },
      { station_name: 'Wates',          station_code: 'WT',  created_at: now, updated_at: now },
      { station_name: 'Yogyakarta',     station_code: 'YK',  created_at: now, updated_at: now },
      { station_name: 'Klaten',         station_code: 'KT',  created_at: now, updated_at: now },
      { station_name: 'Solo Balapan',   station_code: 'SLO', created_at: now, updated_at: now }
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('stations', null, {});
  }
};