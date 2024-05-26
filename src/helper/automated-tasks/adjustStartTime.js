// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { GO_TASK_SERVICE } = require('../../utils/config');

// Packages
const axios = require('axios');

// Repository
const Repository = require('../../repository');
const { SETTING_LEVELS } = require('../../utils/enums');

const adjustStartTime = async ({ userIds = [], sdIds = [] }) => {
  try {
    console.log({ userIds, sdIds });
    if (sdIds?.length) {
      const [sdUsers, errForSdUsers] = await Repository.fetchAll({
        tableName: DB_TABLES.USER,
        query: { sd_id: sdIds },
        extras: { attributes: ['user_id'] },
        include: {
          [DB_TABLES.SETTINGS]: {
            where: {
              automated_task_setting_priority: SETTING_LEVELS.SUB_DEPARTMENT,
            },
            attributes: [],
            required: true,
          },
        },
      });
      sdUsers?.map((u) => userIds.push(u.user_id));
    }
    console.log(userIds);

    const res = await axios.post(`${GO_TASK_SERVICE}/v1/adjust`, {
      user_ids: [...new Set(userIds)],
    });
    logger.info(JSON.stringify(res.data, null, 4));
  } catch (err) {
    logger.error(`Error while adjusting start time: `, err);
    return [null, err.message];
  }
};

module.exports = adjustStartTime;
