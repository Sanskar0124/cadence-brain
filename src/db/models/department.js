'use strict';
// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Department extends Model {
    static associate({ User, Company, Sub_Department }) {
      this.hasMany(User, { foreignKey: 'department_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.hasMany(Sub_Department, { foreignKey: 'department_id' });
    }
  }
  Department.init(
    {
      department_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'department',
      modelName: 'Department',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Department;
};
