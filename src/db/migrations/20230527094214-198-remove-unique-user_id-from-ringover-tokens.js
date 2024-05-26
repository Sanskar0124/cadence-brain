module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new column user_id_temp
    await queryInterface.addColumn('ringover_tokens', 'user_id_temp', {
      type: Sequelize.UUID,
    });

    // Copy values from user_id to user_id_temp
    await queryInterface.sequelize.query(
      'UPDATE ringover_tokens SET user_id_temp = user_id'
    );

    // Remove column user_id
    await queryInterface.removeColumn('ringover_tokens', 'user_id');

    // Create new column user_id
    await queryInterface.addColumn('ringover_tokens', 'user_id', {
      type: Sequelize.UUID,
      unique: false,
    });

    // Move values from user_id_temp to user_id
    await queryInterface.sequelize.query(
      'UPDATE ringover_tokens SET user_id = user_id_temp'
    );

    // Remove column user_id_temp
    await queryInterface.removeColumn('ringover_tokens', 'user_id_temp');
  },

  down: async (queryInterface, Sequelize) => {
    // Add column user_id_temp
    await queryInterface.addColumn('ringover_tokens', 'user_id_temp', {
      type: Sequelize.UUID,
    });

    // Copy values from user_id to user_id_temp
    await queryInterface.sequelize.query(
      'UPDATE ringover_tokens SET user_id_temp = user_id'
    );

    // Remove column user_id
    await queryInterface.removeColumn('ringover_tokens', 'user_id');

    // Create column user_id
    await queryInterface.addColumn('ringover_tokens', 'user_id', {
      type: Sequelize.UUID,
      unique: false,
    });

    // Move values from user_id_temp to user_id
    await queryInterface.sequelize.query(
      'UPDATE ringover_tokens SET user_id = user_id_temp'
    );

    // Remove column user_id_temp
    await queryInterface.removeColumn('ringover_tokens', 'user_id_temp');
  },
};
