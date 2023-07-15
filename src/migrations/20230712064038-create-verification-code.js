"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Verification_Codes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verification_type: {
        type: Sequelize.ENUM("email", "phone", "login"),
        allowNull: false,
      },
      expiration: {
        type: Sequelize.DATE,
      },
      used: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Verification_Codes");
  },
};
