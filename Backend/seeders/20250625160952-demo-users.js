'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'User Biasa',
        email: 'user@email.com',
        password: hashedPassword,
        phone: '081111111111',
        role: 'user',
        nik: '3210000000000001',
        address: 'Jl. Pengguna, Bandung',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Admin',
        email: 'admin@email.com',
        password: hashedPassword,
        phone: '082222222222',
        role: 'admin',
        nik: '3210000000000002',
        address: 'Jl. Admin, Jakarta',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Visitor',
        email: 'visitor@email.com',
        password: hashedPassword,
        phone: '083333333333',
        role: 'visitor',
        nik: '3210000000000003',
        address: 'Jl. Tamu, Surabaya',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};