// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { EMAIL_STATUS } = require('../../utils/enums');

//Packages
const { Op } = require('sequelize');

// Repositories
const {
  sequelize,
  Task,
  Email,
  Node,
  User,
  Cadence,
} = require('../../db/models');
const Repository = require('../../repository');

const getMailTasksForHistoryGraphV2 = async (
  user,
  startDate,
  endDate,
  userIds = null,
  cadenceId = null,
  nodeTypeQuery,
  intervalAttribute,
  groupBy
) => {
  try {
    const [tasks, errForTasks] = await Repository.fetchAll({
      tableName: DB_TABLES.TASK,
      query: {
        cadence_id: cadenceId ?? { [Op.ne]: null },
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
        [DB_TABLES.EMAIL]: {
          as: 'email',
          where: {
            created_at: {
              [Op.between]: [startDate, endDate],
            },
            sent: true,
          },
          attributes: [],
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
        logging: true,
        attributes: [
          intervalAttribute,
          [
            sequelize.literal(`COUNT(DISTINCT task_id,
          CASE WHEN email.status = "${EMAIL_STATUS.BOUNCED}"
          THEN 1
          ELSE NULL
          END )`),
            'bounced_count',
          ],
          [
            sequelize.literal(`COUNT(DISTINCT task_id,
                CASE WHEN email.status = "${EMAIL_STATUS.BOUNCED}"
                THEN 1
                ELSE NULL
                END )`),
            'bounced_count',
          ],
          [
            sequelize.literal(`COUNT(DISTINCT task_id, CASE
                      WHEN email.unsubscribed = 1
                        THEN 1
                        ELSE NULL
                      END ) `),
            'unsubscribed_count',
          ],
          [
            sequelize.literal(`COUNT(DISTINCT task_id,CASE
                      WHEN email.status IN ("${EMAIL_STATUS.DELIVERED}", "${EMAIL_STATUS.OPENED}", "${EMAIL_STATUS.CLICKED}") AND email.sent=1
                        THEN 1
                        ELSE NULL
                      END ) `),
            'delivered_count',
          ],
          [
            sequelize.literal(`COUNT(DISTINCT task_id,CASE
                      WHEN email.status IN ("${EMAIL_STATUS.OPENED}", "${EMAIL_STATUS.CLICKED}") AND email.sent=1
                        THEN 1
                        ELSE NULL
                      END ) `),
            'opened_count',
          ],
          [
            sequelize.literal(`COUNT(DISTINCT task_id,CASE
                      WHEN email.status IN ("${EMAIL_STATUS.CLICKED}") AND email.sent=1
                        THEN 1
                        ELSE NULL
                      END ) `),
            'clicked_count',
          ],
        ],
        group: groupBy,
      },
    });
    if (errForTasks) {
      logger.error(`Error while fetching tasks for mail graph`, errForTasks);
      return [null, errForTasks];
    }

    return [tasks, null];
  } catch (err) {
    logger.error(`Error while getting mail tasks for history graph`, err);
    return [null, err.message];
  }
};

module.exports = getMailTasksForHistoryGraphV2;
