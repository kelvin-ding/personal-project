"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    }
  }
  RefreshToken.init(
    {
      token: DataTypes.STRING,
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      ip_address: DataTypes.STRING,
      user_agent: DataTypes.STRING,
      expires_at: DataTypes.DATE,
    },

    {
      sequelize,
      modelName: "RefreshToken",
    }
  );
  return RefreshToken;
};
