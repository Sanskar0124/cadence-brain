'use strict';
const { Model } = require('sequelize');

// Helpers and Services
const CryptoHelper = require('../../helper/crypto');

module.exports = (sequelize, Sequelize) => {
  class Salesforce_Tokens extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id', sourceKey: 'user_id' });
    }
  }
  Salesforce_Tokens.init(
    {
      salesforce_token_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      encrypted_access_token: {
        type: Sequelize.STRING(10000),
        allowNull: true,
      },
      access_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedAccessToken, errForDecryptedAccessToken] =
            CryptoHelper.decrypt(this.encrypted_access_token);

          if (!errForDecryptedAccessToken) return decryptedAccessToken;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `access token` value!');
        },
      },
      encrypted_refresh_token: {
        type: Sequelize.STRING(10000),
        allowNull: true,
      },
      refresh_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedRefreshToken, errForDecryptedRefreshToken] =
            CryptoHelper.decrypt(this.encrypted_refresh_token);

          if (!errForDecryptedRefreshToken) return decryptedRefreshToken;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `refresh token` value!');
        },
      },
      encrypted_instance_url: {
        type: Sequelize.STRING(10000),
        allowNull: true,
      },
      instance_url: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedInstanceUrl, errForDecryptedInstanceUrl] =
            CryptoHelper.decrypt(this.encrypted_instance_url);

          if (!errForDecryptedInstanceUrl) return decryptedInstanceUrl;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `instance url` value!');
        },
      },
      is_logged_out: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'salesforce_tokens',
      modelName: 'Salesforce_Tokens',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Salesforce_Tokens;
};
