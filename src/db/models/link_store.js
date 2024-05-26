// Packages
const { Model } = require('sequelize');

// model definition

module.exports = (sequelize, Sequelize) => {
  class LinkStore extends Model {
    static associate({ Email, Message }) {
      LinkStore.belongsTo(Email, {
        foreignKey: 'message_id',
      });
      LinkStore.belongsTo(Message, {
        foreignKey: 'sms_id',
      });
    }
  }

  LinkStore.init(
    {
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      message_id: {
        type: Sequelize.STRING,
        defaultValue: 'NONE',
      },
      sms_id: {
        type: Sequelize.STRING,
        defaultValue: 'NONE',
      },
      redirect_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      link_text: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_clicked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      clicked_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      clicked: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      tableName: 'link_store',
      sequelize,
      modelName: 'LinkStore',
      freezeTableName: true,
    }
  );
  return LinkStore;
};
