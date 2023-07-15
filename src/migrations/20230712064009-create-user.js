"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      first_name: {
        type: Sequelize.STRING,
      },
      last_name: {
        type: Sequelize.STRING,
      },
      birthdate: {
        type: Sequelize.DATE,
      },
      phone_number: {
        type: Sequelize.STRING,
      },
      phone_verified: {
        type: Sequelize.BOOLEAN,
      },
      email: {
        type: Sequelize.STRING,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
      },
      password: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.ENUM("reader", "author", "admin"),
        allowNull: false,
        defaultValue: "reader",
      },
      provider: {
        type: Sequelize.STRING,
      },
      verified: {
        type: Sequelize.BOOLEAN,
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0, // set the default value as 0
      },
      lock_until: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Users");
  },
};
