'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class A_B_Testing extends Model {
    static associate({ Email, Message }) {
      this.belongsTo(Email, {
        foreignKey: 'message_id',
      });
      this.belongsTo(Message, {
        foreignKey: 'sms_id',
      });
    }
  }
  A_B_Testing.init(
    {
      ab_testing_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      sms_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      ab_template_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      node_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      validate: {
        validRow() {
          if (!this.message_id && !this.sms_id) {
            throw new Error('Both message_id and sms_id are not there');
          }
        },
      },
      sequelize,
      tableName: 'a_b_testing',
      modelName: 'A_B_Testing',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return A_B_Testing;
};
