"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.IP_Address, {
        foreignKey: "user_id",
      });
      User.hasMany(models.Verification_Code, {
        foreignKey: "user_id",
      });
      this.hasMany(models.RefreshToken, {
        foreignKey: "user_id",
        as: "refreshTokens",
      });
    }
  }
  User.init(
    {
      first_name: DataTypes.STRING(50),
      last_name: DataTypes.STRING(50),
      birthdate: DataTypes.DATE,
      phone_number: DataTypes.STRING(20),
      phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      email: { type: DataTypes.STRING(255), unique: true },
      email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      password: DataTypes.STRING,
      provider: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM,
        values: ["reader", "author", "admin"],
      },
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      login_attempts: DataTypes.INTEGER,
      lock_until: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
