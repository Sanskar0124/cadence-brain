'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Cadence_Template extends Model {
    static associate({ User }) {
      this.belongsTo(User, {
        foreignKey: 'user_id',
      });
    }
  }
  Cadence_Template.init(
    {
      cadence_template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING, // * ["inbound" , "outbound"]
        allowNull: false,
      },
      language: {
        type: Sequelize.STRING, // * ["english" , "french", "spanish"]
        allowNull: false,
      },
      nodes: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID, // * Support agent who created this template
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'cadence_template',
      modelName: 'Cadence_Template',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Cadence_Template;
};
