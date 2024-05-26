'use strict';
// Utils
const { LIST_STATUS } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class List extends Model {
    static associate({ Cadence, Task, Sub_Department, User }) {
      this.hasOne(Cadence, {
        sourceKey: 'cadence_id',
        foreignKey: 'cadence_id',
      });
      this.hasOne(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(User, { foreignKey: 'user_id', constraints: false });
    }
  }
  List.init(
    {
      list_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        // * Validate this with enum while creating node
        type: Sequelize.STRING,
        defaultValue: LIST_STATUS.NOT_STARTED,
      },
      inside_sales: {
        // * This is for the inbound list created for inbound leads
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'list',
      modelName: 'List',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return List;
};
