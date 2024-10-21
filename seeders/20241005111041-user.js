"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPasswordSargeant = await bcrypt.hash("abcDEF123!", 10);
        const hashedPasswordSysAdmin = await bcrypt.hash("abcDEF123!", 10);
        await queryInterface.bulkInsert("users", [
            {
                us_fullname: "Sigit Sasongko",
                us_username: "sargeant",
                us_email: "siko.spade31@gmail.com",
                us_phone_number: "085725363777",
                us_password: hashedPasswordSargeant,
                us_created_on: new Date(),
                us_updated_on: new Date(),
                us_active: true,
            },
            {
                us_fullname: "Phincon Academy",
                us_username: "phinconacademy",
                us_email: "phinconacademy@gmail.com",
                us_phone_number: "081234567890",
                us_password: hashedPasswordSysAdmin,
                us_created_on: new Date(),
                us_updated_on: new Date(),
                us_active: true,
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("users", null, {});
    },
};
