'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('activity', 'message_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.sequelize.query(
      'UPDATE activity SET message_id=gmail_message_id;'
    );

    // await queryInterface.removeColumn("activity", "gmail_message_id");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('activity', 'message_id');
    // await queryInterface.addColumn("activity", "gmail_message_id", {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });
  },
};
