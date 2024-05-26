'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Note extends Model {
    static associate({ Lead }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
    }
  }
  Note.init(
    {
      note_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      note: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      salesforce_note_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'note',
      modelName: 'Note',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Note;
};
