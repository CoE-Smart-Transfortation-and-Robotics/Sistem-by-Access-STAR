'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('train_categories', [
      {
        category_name: 'Antar Kota Antar Provinsi',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'train_categories',
      { category_name: 'Antar Kota Antar Provinsi' },
    );
  },
};