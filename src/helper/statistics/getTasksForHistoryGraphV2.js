// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

//Packages
const { Op } = require('sequelize');

// Repositories
const { sequelize } = require('../../db/models');
const Repository = require('../../repository');

const getTasksForHistoryGraphV2 = async (
  user,
  start_date,
  end_date,
  user_ids = null,
  cadence_id = null,
  node_type,
  intervalAttribute,
  groupBy
) => {
  try {
    const [tasks, errForTasks] = await Repository.fetchAll({
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
            type: node_type,
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
          where: {
            company_id: user.company_id,
          },
          required: true,
        },
        [DB_TABLES.LEAD]: {
          attributes: [],
          required: true,
        },
      },
      extras: {
        attributes: [
          intervalAttribute,
          [sequelize.literal(`COUNT(DISTINCT task_id ) `), 'count'],
        ],
        group: groupBy,
      },
    });

    if (errForTasks) {
      logger.error('Error while fetching graph', errForTasks);
      return [null, errForTasks];
    }

    return [tasks, null];
  } catch (err) {
    logger.error(`Error while getting tasks for history graph`, err);
    return [null, err.message];
  }
};

module.exports = getTasksForHistoryGraphV2;
