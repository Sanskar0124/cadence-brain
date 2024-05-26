'use strict';

const { LEAD_SCORE_RUBRIKS } = require('../../utils/enums');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lead_score_reasons', {
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
      lead_warmth: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      has_warmth_changed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      score_delta: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lead_score_reasons');
  },
};
