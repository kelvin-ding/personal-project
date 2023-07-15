'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IP_Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  IP_Address.init({
    user_id: DataTypes.INTEGER,
    ip_address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'IP_Address',
  });
  return IP_Address;
};