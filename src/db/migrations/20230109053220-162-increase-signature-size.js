'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'signature',
      'signature',
      'temp_signature'
    );

    await queryInterface.addColumn('signature', 'signature', {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    });

    await queryInterface.sequelize.query(
      'update signature set signature=temp_signature;'
    );

    return await queryInterface.removeColumn('signature', 'temp_signature');
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.changeColumn('signature', 'signature', {
      type: Sequelize.STRING(10000),
      allowNull: true,
    });
  },
};
