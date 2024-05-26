// Utils
const logger = require('../../utils/winston');
const { GO_TASK_SERVICE } = require('../../utils/config');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const axios = require('axios');
const { Op } = require('sequelize');

// Repository
const Repository = require('../../repository');

const deleteAutomatedTasks = async (taskQuery = {}) => {
  try {
    const [automatedTasks, errForAutomatedTasks] = await Repository.fetchAll({
      tableName: DB_TABLES.AUTOMATED_TASKS,
      query: {},
      include: {
        [DB_TABLES.TASK]: {
          where: taskQuery,
          required: true,
        },
      },
    });

    let automatedTasksIds = [];
    let userIds = [];

    automatedTasks?.map((at) => {
      automatedTasksIds.push(at.at_id);
      userIds.push(at.user_id);
    }) || [];

    if (automatedTasksIds?.length === 0) return [`No tasks found.`, null];

    const [data, err] = await Repository.destroy({
      tableName: DB_TABLES.AUTOMATED_TASKS,
      query: {
        at_id: {
          [Op.in]: automatedTasksIds,
        },
      },
    });

    const res = await axios.post(`${GO_TASK_SERVICE}/v1/adjust`, {
      user_ids: [...new Set(userIds)],
    });
    logger.info(JSON.stringify(res.data, null, 4));

    return [data, err];
  } catch (err) {
    logger.error(`Error while deleting automated tasks: `, err);
    return [null, `Error while deleting automated tasks: ${err.message}.`];
  }
};

module.exports = deleteAutomatedTasks;
