'use strict';
// Packages
const { Model, Op } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class Task extends Model {
    static associate({
      Lead,
      User,
      Node,
      Cadence,
      Daily_Tasks,
      Email,
      LeadToCadence,
      Activity,
    }) {
      this.belongsTo(Lead, { foreignKey: 'lead_id' });
      this.belongsTo(User, { foreignKey: 'user_id' });
      this.belongsTo(Node, { foreignKey: 'node_id' });
      this.belongsTo(Cadence, { foreignKey: 'cadence_id' });
      this.hasOne(Daily_Tasks, {
        foreignKey: 'task_id',
        sourceKey: 'task_id',
      });
      this.hasOne(Email, {
        foreignKey: 'lead_id',
        sourceKey: 'lead_id',
        scope: {
          [Op.and]: sequelize.where(
            sequelize.col('Task.node_id'),
            Op.eq,
            sequelize.col('email.node_id')
          ),
        },
        as: 'email',
        constraints: false,
      });
      this.hasOne(LeadToCadence, {
        foreignKey: 'lead_id',
        sourceKey: 'lead_id',
        scope: {
          [Op.and]: sequelize.where(
            sequelize.col('Task.cadence_id'),
            Op.eq,
            sequelize.col('LeadToCadence.cadence_id')
          ),
        },
        as: 'leadtocadence',
        constraints: false,
      });
      this.hasMany(Activity, { foreignKey: 'activity_id' });
    }
  }
  Task.init(
    {
      task_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_time: {
        /**
         * * time at which this task should be showed on sales person's dashboard i.e. start_time for task
         * * this will be stored as unix timestamp
         */
        type: Sequelize.BIGINT,
        allownull: false,
      },
      shown_time: {
        /**
         * * time at which the task will was showed on sales person's dashboard.
         */
        type: Sequelize.BIGINT,
        allownull: true,
      },
      late_time: {
        /**
         * * time after which the task will be showed as late on sales person's dashboard.
         */
        type: Sequelize.BIGINT,
        allownull: true,
      },
      urgent_time: {
        /**
         * * time after which this task should be showed as urgent on sales person's dashboard i.e. urgent_time for task
         * * this will be stored as unix timestamp
         */
        type: Sequelize.BIGINT,
        allownull: false,
      },
      complete_time: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      skip_time: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      cadence_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_skipped: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: { task_reason: '' },
      },
      skip_reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      to_show: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      event_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // duration for custom tasks, stored in minutes
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'incomplete',
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: 'task',
      modelName: 'Task',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  return Task;
};
