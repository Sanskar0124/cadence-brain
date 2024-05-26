'use strict';
// Packages
const { Model } = require('sequelize');

// Helpers and Services
const CryptoHelper = require('../../helper/crypto');

module.exports = (sequelize, Sequelize) => {
  class Company_Tokens extends Model {
    static associate({ Company }) {
      this.belongsTo(Company, { foreignKey: 'company_id' });
    }
  }
  Company_Tokens.init(
    {
      ct_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      encrypted_lusha_api_key: { type: Sequelize.STRING, allowNull: true },
      lusha_api_key: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedLushaApiKey, errDecryptedLushaApiKey] =
            CryptoHelper.decrypt(this.encrypted_lusha_api_key);
          if (!errDecryptedLushaApiKey) return decryptedLushaApiKey;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `lusha api key` value!');
        },
      },
      encrypted_kaspr_api_key: { type: Sequelize.STRING, allowNull: true },
      kaspr_api_key: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedKasprApiKey, errDecryptedKasprApiKey] =
            CryptoHelper.decrypt(this.encrypted_kaspr_api_key);
          if (!errDecryptedKasprApiKey) return decryptedKasprApiKey;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `kaspr api key` value!');
        },
      },
      encrypted_hunter_api_key: { type: Sequelize.STRING, allowNull: true },
      hunter_api_key: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedHunterApiKey, errDecryptedHunterApiKey] =
            CryptoHelper.decrypt(this.encrypted_hunter_api_key);
          if (!errDecryptedHunterApiKey) return decryptedHunterApiKey;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `hunter api key` value!');
        },
      },
      encrypted_dropcontact_api_key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dropcontact_api_key: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedDCApiKey, errDecryptedDCApiKey] =
            CryptoHelper.decrypt(this.encrypted_dropcontact_api_key);
          if (!errDecryptedDCApiKey) return decryptedDCApiKey;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `dropcontact api key` value!');
        },
      },
      encrypted_snov_client_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      snov_client_id: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedSnovClientId, errDecryptedSnovClientId] =
            CryptoHelper.decrypt(this.encrypted_snov_client_id);
          if (!errDecryptedSnovClientId) return decryptedSnovClientId;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `snov client id` value!');
        },
      },
      encrypted_snov_client_secret: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      snov_client_secret: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedSnovClientSecret, errDecryptedSnovClientSecret] =
            CryptoHelper.decrypt(this.encrypted_snov_client_secret);
          if (!errDecryptedSnovClientSecret) return decryptedSnovClientSecret;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `snov client id` value!');
        },
      },
      encrypted_api_token: { type: Sequelize.STRING, allowNull: true },
      api_token: {
        type: Sequelize.VIRTUAL,
        get() {
          const [decryptedApiToken, errDecryptedApiToken] =
            CryptoHelper.decrypt(this.encrypted_api_token);
          if (!errDecryptedApiToken) return decryptedApiToken;

          return '';
        },
        set() {
          throw new Error('Do not try to set the `api token` value!');
        },
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      modelName: 'Company_Tokens',
      tableName: 'company_tokens',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Company_Tokens;
};
