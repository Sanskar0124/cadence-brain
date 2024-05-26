'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn(
        'email_template',
        'company_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'sd_id',
          defaultValue: null,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'linkedin_template',
        'company_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'sd_id',
          defaultValue: null,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'message_template',
        'company_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'sd_id',
          defaultValue: null,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'script_template',
        'company_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          after: 'sd_id',
          defaultValue: null,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn('email_template', 'company_id', {
        transaction,
      });
      await queryInterface.removeColumn('linkedin_template', 'company_id', {
        transaction,
      });
      await queryInterface.removeColumn('message_template', 'company_id', {
        transaction,
      });
      await queryInterface.removeColumn('script_template', 'company_id', {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
    }
  },
};
