// Utils
const logger = require('../../utils/winston');
const { HEATMAP_OPTIONS, NODE_TYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

//Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Helper
const formatTasksToIntervals = require('./formatTasksToIntervals');

const getCompleteTasksInInterval = async (
  clientQueryParams,
  dbQueryParams,
  heatMap
) => {
  try {
    const { start_date, end_date, user } = dbQueryParams;
    const { node_type, cadence_id, user_ids } = clientQueryParams;

    let tasks = null,
      errForTasks = null;

    let queryCondition = {
      type: node_type,
    };

    if (node_type === HEATMAP_OPTIONS.DONE_TASKS) {
      queryCondition = {
        type: {
          [Op.notIn]: [NODE_TYPES.AUTOMATED_MAIL, NODE_TYPES.AUTOMATED_MESSAGE],
        },
      };
    }

    if (
      node_type === NODE_TYPES.MAIL ||
      node_type === NODE_TYPES.AUTOMATED_MAIL
    ) {
      let typesForQuery;
      if (node_type === NODE_TYPES.AUTOMATED_MAIL)
        typesForQuery = [
          NODE_TYPES.AUTOMATED_MAIL,
          NODE_TYPES.AUTOMATED_REPLY_TO,
        ];
      else typesForQuery = [NODE_TYPES.MAIL, NODE_TYPES.REPLY_TO];

      [tasks, errForTasks] = await Repository.fetchAll({
        tableName: DB_TABLES.TASK,
        query: {
          cadence_id: cadence_id ?? { [Op.ne]: null },
          user_id: user_ids ?? { [Op.ne]: null },
          complete_time: {
            [Op.between]: [start_date, end_date],
          },
          completed: true,
        },
        include: {
          [DB_TABLES.NODE]: {
            where: {
              type: typesForQuery,
            },
            required: true,
            attributes: [],
          },
          [DB_TABLES.LEAD]: {
            attributes: ['lead_id'],
            required: true,
            [DB_TABLES.EMAIL]: {
              attributes: ['status'],
              where: {
                created_at: {
                  [Op.between]: [start_date, end_date],
                },
                sent: true,
              },
              order: [['created_at', 'DESC']],
              required: true,
              limit: 1,
            },
          },
          [DB_TABLES.USER]: {
            attributes: [],
            where: {
              company_id: user.company_id,
            },
            required: true,
          },
          [DB_TABLES.CADENCE]: {
            attributes: [],
            required: true,
          },
        },
        extras: {
          attributes: ['task_id', 'complete_time'],
        },
      });
      if (errForTasks) {
        logger.error('Error while fetching graph', errForTasks);
        return [null, errForTasks];
      }
    } else {
      [tasks, errForTasks] = await Repository.fetchAll({
        tableName: DB_TABLES.TASK,
        query: {
          cadence_id: cadence_id ?? { [Op.ne]: null },
          user_id: user_ids ?? { [Op.ne]: null },
          complete_time: {
            [Op.between]: [start_date, end_date],
          },
          completed: true,
        },
        include: {
          [DB_TABLES.NODE]: {
            where: queryCondition,
            required: true,
            attributes: [],
          },
          [DB_TABLES.CADENCE]: {
            attributes: [],
            required: true,
          },
          [DB_TABLES.USER]: {
            attributes: [],
            where: {
              company_id: user.company_id,
            },
            required: true,
          },
        },
        extras: {
          attributes: ['task_id', 'complete_time'],
        },
      });
    }

    if (errForTasks) {
      logger.error('Error while fetching graph', errForTasks);
      return [null, errForTasks];
    }
    let heatMapUpdated = formatTasksToIntervals(tasks, user?.timezone, heatMap);
    return [heatMapUpdated, null];
  } catch (err) {
    logger.error(`Error in getCompleteTasksInInterval: `, err);
    return [null, err.message];
  }
};

module.exports = getCompleteTasksInInterval;
