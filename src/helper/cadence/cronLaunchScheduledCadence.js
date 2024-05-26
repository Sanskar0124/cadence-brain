// Utils
const logger = require('../../utils/winston');
const { CADENCE_STATUS, ACTIVITY_TYPE } = require('../../utils/enums');
const utils = require('./utils/utils');
// Packages
const { Op } = require('sequelize');
// Repositories
const Repository = require('../../repository');
const { DB_TABLES } = require('../../utils/modelEnums');
const { sequelize } = require('../../db/models');
const CadenceHelper = require('.');
// Helpers and services

const launchScheduledCadence = async () => {
  const t = await sequelize.transaction();
  try {
    const [schedules, errForSchedules] = await Repository.fetchAll({
      tableName: DB_TABLES.CADENCE_SCHEDULE,
      query: {
        launch_at: {
          [Op.lte]: new Date().getTime() + 60000, //get All those cadences whose launching time  is not more than 1 minutes
        },
      },
      include: {
        [DB_TABLES.CADENCE]: {
          [DB_TABLES.USER]: {
            attributes: ['email'],
          },
          attributes: ['user_id'],
        },
      },
    });

    if (errForSchedules) {
      t.rollback();
      return [null, errForSchedules];
    }
    if (schedules.length === 0) {
      t.rollback();
      return [false, null];
    }

    schedules.forEach((schedule) => {
      setTimeout(() => {
        utils.launchCadence(
          schedule?.cadence_id,
          schedule?.Cadence?.user_id,
          CADENCE_STATUS.NOT_STARTED
        );
        logger.info(`Launching Scheduled Cadence ${schedule?.cadence_id}`);
      }, schedule.launch_at - new Date().getTime());
    });

    t.commit();
    return [true, null];
  } catch (err) {
    t.rollback();
    logger.error(`Error while updating cadence launch schedule: `, err);
    return [null, err.message];
  }
};

module.exports = launchScheduledCadence;
