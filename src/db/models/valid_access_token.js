'use strict';

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Valid_Access_Token extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
    }
  }
  Valid_Access_Token.init(
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      access_token: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'valid_access_token',
      modelName: 'Valid_Access_Token',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Valid_Access_Token;
};
