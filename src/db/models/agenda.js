'use strict';
// Utils
const { AGENDA_TYPE } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Agenda extends Model {
    static associate({ Lead, User }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  Agenda.init(
    {
      agenda_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: Object.values(AGENDA_TYPE),
        allowNull: true,
      },
      scheduled: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      google_event_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      recurring_event_Id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'agenda',
      modelName: 'Agenda',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Agenda;
};
