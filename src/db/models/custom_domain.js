'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class Custom_Domain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Company }) {
      // define association here
      this.belongsTo(Company, { foreign_key: 'company_id' });
    }
  }
  Custom_Domain.init(
    {
      cd_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      domain_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      domain_status: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: 'Custom_Domain',
      tableName: 'custom_domain',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Custom_Domain;
};
