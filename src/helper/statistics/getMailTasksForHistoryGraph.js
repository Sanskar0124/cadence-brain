// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

//Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

const getMailTasksForHistoryGraph = async (
  user,
  startDate,
  endDate,
  userIds = null,
  cadenceId = null,
  cadenceIdFallback,
  nodeTypeQuery,
  userQuery
) => {
  try {
    const [tasks, errForTasks] = await Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: {
        cadence_id: cadenceId ?? cadenceIdFallback,
        user_id: userIds ?? { [Op.ne]: null },
        complete_time: {
          [Op.between]: [startDate, endDate],
        },
        completed: true,
      },
      include: {
        [DB_TABLES.NODE]: {
          where: {
            type: nodeTypeQuery,
          },
          attributes: [],
          required: true,
        },
        [DB_TABLES.LEAD]: {
          attributes: ['lead_id'],
          required: true,
          [DB_TABLES.EMAIL]: {
            required: true,
            attributes: ['status', 'unsubscribed'],
            subQuery: false,
            where: {
              created_at: {
                [Op.between]: [startDate, endDate],
              },
              sent: true,
            },
            order: [['created_at', 'DESC']],
            limit: 1,
          },
        },
        [DB_TABLES.USER]: {
          attributes: [],
          where: userQuery,
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

    return [tasks, null];
  } catch (err) {
    logger.error(`Error while getting mail tasks for history graph`, err);
    return [null, err];
  }
};

module.exports = getMailTasksForHistoryGraph;
