// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

//Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');
const {
  NODE_TYPES,
  CADENCE_STATUS,
  LEAD_STATUS,
  CADENCE_LEAD_STATUS,
  CUSTOM_TASK_NODE_ID,
} = require('../../utils/enums');

const getPendingTasks = async (
  user,
  startDate,
  endDate,
  userIds = null,
  cadenceIds = null,
  cadenceIdFallback,
  userQuery,
  lateSettings
) => {
  try {
    const [tasks, errForTasks] = await Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: {
        cadence_id: cadenceIds ?? cadenceIdFallback,
        user_id: userIds ?? { [Op.ne]: null },
        completed: false,
        is_skipped: false,
        start_time: {
          [Op.between]: [startDate, endDate],
        },
        node_id: {
          [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID),
        },
      },

      include: {
        [DB_TABLES.CADENCE]: {
          where: {
            status: CADENCE_STATUS.IN_PROGRESS,
          },
          attributes: [],
          required: true,
        },
        [DB_TABLES.LEAD]: {
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING], // * Tasks for leads with status of 'new_lead' and 'ongoing'
            },
          },
          required: true,
          attributes: [],
          [DB_TABLES.LEADTOCADENCE]: {
            where: {
              cadence_id: {
                [Op.eq]: sequelize.col('Task.cadence_id'),
              },
              status: CADENCE_LEAD_STATUS.IN_PROGRESS,
            },
            attributes: [],
          },
        },
        [DB_TABLES.NODE]: {
          attributes: [
            'type',
            [
              sequelize.literal(
                `COUNT(
                      CASE 
                        WHEN Node.type='${
                          NODE_TYPES.CALL
                        }' and Task.start_time + ${
                  lateSettings[NODE_TYPES.CALL] || 0
                } < ${new Date().getTime()}
                        THEN  1
         WHEN Node.type in ('${NODE_TYPES.MAIL}','${
                  NODE_TYPES.REPLY_TO
                }') and Task.start_time + ${
                  lateSettings[NODE_TYPES.MAIL] || 0
                } < ${new Date().getTime()}
                        THEN  1
         WHEN Node.type='${NODE_TYPES.MESSAGE}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.MESSAGE] || 0
                } < ${new Date().getTime()}
                        THEN  1
         WHEN Node.type in ('${NODE_TYPES.LINKEDIN_MESSAGE}','${
                  NODE_TYPES.LINKEDIN_PROFILE
                }','${NODE_TYPES.LINKEDIN_CONNECTION}','${
                  NODE_TYPES.LINKEDIN_INTERACT
                }') and Task.start_time + ${
                  lateSettings[NODE_TYPES.LINKEDIN_CONNECTION] || 0
                } < ${new Date().getTime()}
                        THEN  1
         WHEN Node.type='${NODE_TYPES.DATA_CHECK}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.DATA_CHECK] || 0
                } < ${new Date().getTime()}
                        THEN  1
         WHEN Node.type='${NODE_TYPES.CADENCE_CUSTOM}' and Task.start_time + ${
                  lateSettings[NODE_TYPES.CADENCE_CUSTOM] || 0
                } < ${new Date().getTime()}
                      THEN  1
          ELSE NULL
                      END )
                    `
              ),
              'late_count',
            ],
          ],
          required: true,
          where: {
            type: {
              [Op.notIn]: [
                NODE_TYPES.AUTOMATED_MAIL,
                NODE_TYPES.AUTOMATED_MESSAGE,
              ],
            },
          },
        },
        [DB_TABLES.USER]: {
          attributes: [],
          where: userQuery,
          required: true,
        },
      },
      extras: {
        raw: true,
        subQuery: false,
        group: ['Node.type'],
        attributes: [
          [
            sequelize.literal(`COUNT(DISTINCT task_id ) `),
            'pending_task_count',
          ],
          [
            sequelize.literal(`COUNT(CASE
                    WHEN Node.is_urgent = 1 
                    THEN 1
                    ELSE NULL
                END ) `),
            'urgent_task_count',
          ],
        ],
      },
    });
    if (errForTasks) {
      logger.error('Error while fetching pending tasks', errForTasks);
      return [null, errForTasks];
    }

    return [tasks, null];
  } catch (err) {
    logger.error(`Error while getting tasks for history graph`, err);
    return [null, err];
  }
};

module.exports = getPendingTasks;
