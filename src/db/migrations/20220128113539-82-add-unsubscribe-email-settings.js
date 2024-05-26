'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // * Add unsubscribe task settings - JSON
    await queryInterface.addColumn(
      'company_settings',
      'unsubscribed_task_settings',
      {
        type: Sequelize.JSON,
        allowNull: true,
        after: 'company_id',
      }
    );

    // * Unsubscribe link mandatory for SEMI-AUTOMATED MAILS
    await queryInterface.addColumn(
      'company_settings',
      'unsubscribe_link_madatory_for_semi_automated_mails',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        after: 'unsubscribed_task_settings',
      }
    );

    // * Unsubscribe link mandatory for AUTOMATED MAILS
    await queryInterface.addColumn(
      'company_settings',
      'unsubscribe_link_madatory_for_automated_mails',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        after: 'unsubscribe_link_madatory_for_semi_automated_mails',
      }
    );

    // * Default text for unsubscribe
    await queryInterface.addColumn(
      'company_settings',
      'default_unsubscribe_link_text',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Unsubscribe',
        after: 'unsubscribe_link_madatory_for_automated_mails',
      }
    );

    // * Unsubscribe from all cadences
    await queryInterface.addColumn(
      'company_settings',
      'unsubscribe_from_all_cadences',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        after: 'default_unsubscribe_link_Text',
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'company_settings',
      'unsubscribed_task_settings'
    );
    await queryInterface.removeColumn(
      'company_settings',
      'unsubscribe_link_madatory_for_semi_automated_mails'
    );
    await queryInterface.removeColumn(
      'company_settings',
      'unsubscribe_link_madatory_for_automated_mails'
    );
    await queryInterface.removeColumn(
      'company_settings',
      'default_unsubscribe_link_text'
    );

    await queryInterface.removeColumn(
      'company_settings',
      'unsubscribe_from_all_cadences'
    );
  },
};
