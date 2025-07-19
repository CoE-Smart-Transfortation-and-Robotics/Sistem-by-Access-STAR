"use strict";

const dayjs = require("dayjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = dayjs().toDate();

    const stations = [
      { station_name: "Angke", station_code: "AK" },
      { station_name: "Batu Ceper", station_code: "BPR" },
      { station_name: "Bekasi", station_code: "BKS" },
      { station_name: "Bojong Indah", station_code: "BOI" },
      { station_name: "Bogor", station_code: "BOO" },
      { station_name: "Buaran", station_code: "BUA" },
      { station_name: "Citayam", station_code: "CTA" },
      { station_name: "Cakung", station_code: "CKG" },
      { station_name: "Cibitung", station_code: "CBT" },
      { station_name: "Cibinong", station_code: "CBG" },
      { station_name: "Cilebut", station_code: "CLT" },
      { station_name: "Cilejit", station_code: "CLG" },
      { station_name: "Cikini", station_code: "CKI" },
      { station_name: "Cileungsi", station_code: "CLSI" },
      { station_name: "Cikudapateuh", station_code: "CKP" },
      { station_name: "Cikoya", station_code: "CKY" },
      { station_name: "Cikupa", station_code: "CKP2" },
      { station_name: "Citeras", station_code: "CTR" },
      { station_name: "Depok", station_code: "DP" },
      { station_name: "Depok Baru", station_code: "DPB" },
      { station_name: "Duri", station_code: "DU" },
      { station_name: "Jatinegara", station_code: "JNG" },
      { station_name: "Jakarta Kota", station_code: "JAK" },
      { station_name: "Juanda", station_code: "JUA" },
      { station_name: "Kalideres", station_code: "KLD" },
      { station_name: "Kampung Bandan", station_code: "KPB" },
      { station_name: "Karet", station_code: "KRT" },
      { station_name: "Kemayoran", station_code: "KMR" },
      { station_name: "Kranji", station_code: "KRJ" },
      { station_name: "Kebayoran", station_code: "KBY" },
      { station_name: "Klender", station_code: "KLD2" },
      { station_name: "Klender Baru", station_code: "KDB" },
      { station_name: "Lenteng Agung", station_code: "LNA" },
      { station_name: "Manggarai", station_code: "MRI" },
      { station_name: "Maja", station_code: "MJ" },
      { station_name: "Nambo", station_code: "NMO" },
      { station_name: "Palmerah", station_code: "PLM" },
      { station_name: "Parung Panjang", station_code: "PRP" },
      { station_name: "Pasar Minggu", station_code: "PSM" },
      { station_name: "Pasar Minggu Baru", station_code: "PMB" },
      { station_name: "Pasar Senen", station_code: "PSE" },
      { station_name: "Pondok Cina", station_code: "POC" },
      { station_name: "Poris", station_code: "PRI" },
      { station_name: "Rangkasbitung", station_code: "RK" },
      { station_name: "Rawabuntu", station_code: "RWT" },
      { station_name: "Serpong", station_code: "SRP" },
      { station_name: "Sudirman", station_code: "SDR" },
      { station_name: "Senen", station_code: "SNN" },
      { station_name: "Sawah Besar", station_code: "SWB" },
      { station_name: "Tanah Abang", station_code: "THB" },
      { station_name: "Tangerang", station_code: "TNG" },
      { station_name: "Tanjung Barat", station_code: "TJB" },
      { station_name: "Tanjung Priok", station_code: "TPK" },
      { station_name: "Tebet", station_code: "TBT" },
      { station_name: "Universitas Indonesia", station_code: "UI" },
    ];

    const data = stations.map((s) => ({
      ...s,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("stations", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("stations", null, {});
  },
};