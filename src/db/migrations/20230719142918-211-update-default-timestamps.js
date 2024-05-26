'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i];

      // Skip the 'conversation' and 'SequelizeMeta' table
      if (tableName === 'conversation' || tableName === 'SequelizeMeta')
        continue;

      await queryInterface.changeColumn(tableName, 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });

      await queryInterface.changeColumn(tableName, 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i];

      // Skip the 'conversation' and 'SequelizeMeta' table
      if (tableName === 'conversation' || tableName === 'SequelizeMeta')
        continue;

      await queryInterface.changeColumn(tableName, 'created_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });

      await queryInterface.changeColumn(tableName, 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
