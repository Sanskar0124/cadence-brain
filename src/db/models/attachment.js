'use strict';
// Packages
const { Model } = require('sequelize');

const { GCP_PRIVATE_BUCKET_URL } = require('../../utils/constants');

module.exports = (sequelize, Sequelize) => {
  class Attachment extends Model {
    static associate({ Message_Template, Email_Template }) {
      this.belongsTo(Message_Template, { foreignKey: 'et_id' });
      this.belongsTo(Email_Template, {
        foreignKey: 'et_id',
        sourceKey: 'et_id',
      });
    }
  }

  Attachment.init(
    {
      attachment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      et_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      original_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // content: {
      //   type: Sequelize.BLOB('long'),
      //   allowNull: false,
      // },
      // content_type: {
      //   type: Sequelize.STRING,
      //   allowNull: false,
      // },
      attachment_url: {
        type: Sequelize.VIRTUAL,
        get() {
          return `${GCP_PRIVATE_BUCKET_URL}/${this.attachment_id}/${this.original_name}`;
        },
        set(value) {
          throw new Error('Do not try to set the `attachment_url` value!');
        },
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'attachment',
      modelName: 'Attachment',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Attachment;
};
