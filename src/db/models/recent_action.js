'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Recent_Action extends Model {
    static associate({ User, Cadence }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Cadence, { foreignKey: 'cadence_id' });
    }
  }
  Recent_Action.init(
    {
      recent_action_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.UUID,
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
      tableName: 'recent_action',
      modelName: 'Recent_Action',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Recent_Action;
};
