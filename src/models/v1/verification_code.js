"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Verification_Code extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Verification_Code.init(
    {
      user_id: DataTypes.INTEGER,
      code: DataTypes.INTEGER,
      token: DataTypes.STRING,
      expiration: DataTypes.DATE,
      verification_type: {
        type: DataTypes.ENUM,
        values: ["email", "phone", "login"],
      },
      used: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Verification_Code",
    }
  );
  return Verification_Code;
};
