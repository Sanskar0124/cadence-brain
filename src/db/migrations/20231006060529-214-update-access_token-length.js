'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // * Salesforce
    await queryInterface.changeColumn(
      'salesforce_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'salesforce_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'salesforce_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );

    // * Pipedrive
    await queryInterface.changeColumn(
      'pipedrive_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'pipedrive_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'pipedrive_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );

    // * Hubspot
    await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );

    // * Zoho
    await queryInterface.changeColumn('zoho_tokens', 'encrypted_access_token', {
      type: Sequelize.STRING(10000),
      allowNull: true,
    });
    await queryInterface.changeColumn(
      'zoho_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn('zoho_tokens', 'encrypted_instance_url', {
      type: Sequelize.STRING(10000),
      allowNull: true,
    });

    // * Bullhorn
    await queryInterface.changeColumn(
      'bullhorn_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'bullhorn_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'bullhorn_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING(10000),
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // * Salesforce
    await queryInterface.changeColumn(
      'salesforce_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'salesforce_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'salesforce_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    // * Pipedrive
    await queryInterface.changeColumn(
      'pipedrive_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING(1000),
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'pipedrive_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'pipedrive_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    // * Hubspot
    await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'hubspot_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );

    // * Zoho
    await queryInterface.changeColumn('zoho_tokens', 'encrypted_access_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn(
      'zoho_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn('zoho_tokens', 'encrypted_instance_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // * Bullhorn
    await queryInterface.changeColumn(
      'bullhorn_tokens',
      'encrypted_access_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'bullhorn_tokens',
      'encrypted_refresh_token',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.changeColumn(
      'bullhorn_tokens',
      'encrypted_instance_url',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },
};
