'use strict';
const { Model } = require('sequelize');

// Helpers and Services
const CryptoHelper = require('../../helper/crypto');

module.exports = (sequelize, Sequelize) => {
  class Ringover_Tokens extends Model {
    static associate({ User }) {
      this.belongsTo(User, {
        foreignKey: 'user_id',
        sourceKey: 'user_id',
      });
    }
  }
  Ringover_Tokens.init(
    {
      ringover_token_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      encrypted_access_token: {
        type: Sequelize.STRING(4000),
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
        type: Sequelize.STRING(4000),
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
      region: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'ringover_tokens',
      modelName: 'Ringover_Tokens',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Ringover_Tokens;
};
