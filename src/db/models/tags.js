'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Tag extends Model {
    static associate({ Cadence }) {
      this.belongsTo(Cadence, { foreignKey: 'cadence_id' });
    }
  }
  Tag.init(
    {
      tag_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tag_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'tag',
      modelName: 'Tag',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Tag;
};
