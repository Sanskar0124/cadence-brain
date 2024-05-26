'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Lead }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
    }
  }
  Conversation.init(
    {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      from_phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      conv_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      sequelize,
      tableName: 'conversation',
      modelName: 'Conversation',
    }
  );
  Conversation.removeAttribute('id');
  return Conversation;
};
