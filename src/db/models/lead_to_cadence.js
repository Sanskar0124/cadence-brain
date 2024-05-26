'use strict';
// Packages
const { Model, Op } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class LeadToCadence extends Model {
    static associate({ Lead, Cadence, Task, Video_Tracking, Node }) {
      this.hasMany(Lead, {
        foreignKey: 'lead_id',
        sourceKey: 'lead_id',
        constraints: false,
      });
      this.hasMany(Cadence, {
        foreignKey: 'cadence_id',
        sourceKey: 'cadence_id',
        constraints: false,
      });
      this.hasMany(Task, {
        foreignKey: 'lead_id',
        sourceKey: 'lead_id',
        constraints: false,
        //scope: {
        //[Op.and]: sequelize.where(
        //sequelize.col('LeadToCadences.cadence_id'),
        //Op.eq,
        //sequelize.col('Tasks.cadence_id')
        //),
        //},
      });
      this.hasMany(Video_Tracking, {
        foreignKey: 'lead_cadence_id',
      });
      this.belongsTo(Node, {
        foreignKey: 'status_node_id',
        sourceKey: 'node_id',
      });
    }
  }
  LeadToCadence.init(
    {
      lead_cadence_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      lead_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cadence_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lead_cadence_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unsubscribed: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      unix_resume_at: {
        type: Sequelize.BIGINT,
      },
      is_bounced: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      unsubscribe_node_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status_node_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },

    {
      timestamps: true,
      sequelize,
      tableName: 'lead_to_cadence',
      modelName: 'LeadToCadence',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return LeadToCadence;
};
