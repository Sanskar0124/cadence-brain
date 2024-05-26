// Utils
const logger = require('../../utils/winston');
const {
  SETTING_LEVELS,
  NODE_TYPES,
  TASK_NAMES_BY_TYPE,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

const updateLateTime = async ({
  userIds = [],
  sdIds = [],
  late_settings = {},
  settings_query = {},
}) => {
  try {
    logger.info('Updating late time...');
    //console.log({ userIds, sdIds });
    if (sdIds?.length) {
      //const [sdUsers, errForSdUsers] = await Repository.fetchAll({
      //tableName: DB_TABLES.USER,
      //query: {
      //sd_id: {
      //[Op.in]: sdIds,
      //},
      //},
      //extras: { attributes: ['user_id'] },
      //include: {
      //[DB_TABLES.SETTINGS]: {
      ////where: {
      ////task_setting_priority: SETTING_LEVELS.SUB_DEPARTMENT,
      ////},
      //where: settings_query,
      //attributes: [],
      //required: true,
      //},
      //},
      //});
      const [sdUsers, errForSdUsers] = await Repository.fetchAll({
        tableName: DB_TABLES.SETTINGS,
        query: settings_query,
        extras: { attributes: [] },
        include: {
          [DB_TABLES.USER]: {
            //where: {
            //task_setting_priority: SETTING_LEVELS.SUB_DEPARTMENT,
            //},
            where: {
              sd_id: {
                [Op.in]: sdIds,
              },
            },
            attributes: ['user_id'],
            required: true,
          },
        },
      });
      sdUsers?.map((u) => userIds.push(u.User.user_id));
    }
    //console.log(userIds);

    const [data, err] = await Repository.update({
      tableName: DB_TABLES.TASK,
      query: {
        user_id: {
          [Op.in]: userIds,
        },
      },
      updateObject: {
        late_time: sequelize.literal(`CASE
					name
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.CALL]}'
						then shown_time + ${late_settings[NODE_TYPES.CALL]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.MAIL]}'
						then shown_time + ${late_settings[NODE_TYPES.MAIL]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.REPLY_TO]}'
						then shown_time + ${late_settings[NODE_TYPES.MAIL]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.MESSAGE]}'
						then shown_time + ${late_settings[NODE_TYPES.MESSAGE]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.DATA_CHECK]}'
						then shown_time + ${late_settings[NODE_TYPES.DATA_CHECK]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.CADENCE_CUSTOM]}'
						then shown_time + ${late_settings[NODE_TYPES.CADENCE_CUSTOM]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_CONNECTION]}'
						then shown_time + ${late_settings[NODE_TYPES.LINKEDIN_CONNECTION]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_MESSAGE]}'
						then shown_time + ${late_settings[NODE_TYPES.LINKEDIN_MESSAGE]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_PROFILE]}'
						then shown_time + ${late_settings[NODE_TYPES.LINKEDIN_PROFILE]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.LINKEDIN_INTERACT]}'
						then shown_time + ${late_settings[NODE_TYPES.LINKEDIN_INTERACT]}
						when '${TASK_NAMES_BY_TYPE[NODE_TYPES.WHATSAPP]}'
						then shown_time + ${late_settings[NODE_TYPES.WHATSAPP]}
						else ${new Date().getTime()}
					END
	`),
      },
      //extras: { logging: console.log },
    });
    logger.info('Updated late time successfully.');
    //console.log(data, err);
    return [`Updated late time successfully.`, null];
  } catch (err) {
    logger.error(`Error while updating late time: `, err);
    return [null, err.message];
  }
};

// (async function test() {
//   updateLateTime({
//     userIds: [],
//     late_settings: {
//       [NODE_TYPES.CALL]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.MESSAGE]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.MAIL]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.LINKEDIN_MESSAGE]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.LINKEDIN_PROFILE]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.LINKEDIN_INTERACT]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.LINKEDIN_CONNECTION]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.DATA_CHECK]: 1 * 24 * 60 * 60 * 1000,
//       [NODE_TYPES.CADENCE_CUSTOM]: 1 * 24 * 60 * 60 * 1000,
//     },
//   });
// })();

module.exports = updateLateTime;
