'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    ALTER TABLE lead_to_cadence 
    ALTER COLUMN lead_cadence_id SET DEFAULT (UUID());
     `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
    ALTER TABLE lead_to_cadence
    ALTER COLUMN lead_cadence_id UUID DEFAULT (NULL);
    `);
  },
};
