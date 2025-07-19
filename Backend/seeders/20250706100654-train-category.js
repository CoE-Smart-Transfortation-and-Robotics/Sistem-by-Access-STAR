'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('train_categories', [
      {
        category_name: 'Antar Kota Antar Provinsi',
        created_at: now,
        updated_at: now,
      },
      {
        category_name: 'KRL (Kereta Rel Listrik)',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('train_categories', {
      category_name: ['Antar Kota Antar Provinsi', 'KRL (Kereta Rel Listrik)'],
    });
  },
};