'use strict';
// Utils
const { CADENCE_PRIORITY } = require('../../utils/enums');

// Packages
const { Model } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Cadence extends Model {
    static associate({
      User,
      Node,
      Tag,
      Sub_Department,
      Task,
      LeadToCadence,
      Company,
      Cadence_Schedule,
      Demo,
      Recent_Action,
    }) {
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Sub_Department, { foreignKey: 'sd_id' });
      this.belongsTo(Company, { foreignKey: 'company_id' });
      this.hasOne(Cadence_Schedule, { foreignKey: 'cadence_id' });
      this.hasMany(Recent_Action, { foreignKey: 'user_id' });
      this.hasMany(Node, {
        foreignKey: 'cadence_id',
        onDelete: 'cascade',
        hooks: true,
      });
      this.hasMany(Tag, {
        foreignKey: 'cadence_id',
        onDelete: 'cascade',
        hooks: true,
      });
      this.hasMany(Task, {
        foreignKey: 'cadence_id',
      });
      this.hasMany(LeadToCadence, {
        foreignKey: 'cadence_id',
        sourceKey: 'cadence_id',
      });
      this.hasMany(Demo, {
        foreignKey: 'demo_id',
      });
    }
  }
  Cadence.init(
    {
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(3000),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: CADENCE_PRIORITY.STANDARD,
      },
      integration_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      inside_sales: {
        // * This is for the inbound cadence created for inbound leads
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: false,
      },
      end_cadence: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      remove_if_reply: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      remove_if_bounce: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      resynching: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
      },
      salesforce_cadence_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      field_map: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      unix_resume_at: {
        type: Sequelize.BIGINT,
      },
      launch_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      sd_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          deleted_nodes_to_resume: {},
        },
      },
      favorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'cadence',
      modelName: 'Cadence',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Cadence;
};
