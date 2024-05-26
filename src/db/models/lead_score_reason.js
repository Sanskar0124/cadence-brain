'use strict';
// Utils
const { LEAD_SCORE_RUBRIKS } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class LeadScoreReasons extends Model {
    static associate({ Lead, Activity }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
      this.belongsTo(Activity, { foreignKey: 'activity_id' });
    }
  }
  LeadScoreReasons.init(
    {
      reason_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Lead', key: 'lead_id' },
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Activity', key: 'activity_id' },
      },
      lead_warmth: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      has_warmth_changed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING,
        values: Object.values(LEAD_SCORE_RUBRIKS),
        allowNull: false,
      },
      // reasons with no associated activities will have a populated metadata field
      metadata: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      score_delta: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'lead_score_reasons',
      modelName: 'Lead_Score_Reasons',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return LeadScoreReasons;
};
