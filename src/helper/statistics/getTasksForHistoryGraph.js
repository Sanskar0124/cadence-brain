// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

//Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

const getTasksForHistoryGraph = async (
  user,
  startDate,
  endDate,
  userIds = null,
  cadenceIds = null,
  cadenceIdFallback,
  nodeTypeQuery,
  userQuery
) => {
  try {
    const [tasks, errForTasks] = await Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: {
        cadence_id: cadenceIds ?? cadenceIdFallback,
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
          required: true,
          attributes: [],
        },
        [DB_TABLES.CADENCE]: {
          attributes: [],
          required: true,
        },
        [DB_TABLES.USER]: {
          attributes: [],
          where: userQuery,
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
    logger.error(`Error while getting tasks for history graph`, err);
    return [null, err];
  }
};

module.exports = getTasksForHistoryGraph;
