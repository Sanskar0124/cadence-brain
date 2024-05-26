// Utils
const logger = require('../../utils/winston');
const { CADENCE_LEAD_STATUS } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Helpers and services
const CadenceHelper = require('./index');
const TaskHelper = require('../task');

const cronUpdateLeadToCadence = async () => {
  logger.info('Resuming paused cadences for leads');
  const endTime = Date.now();

  // * Fetch paused lead to cadences which must be resumed before current time
  const [leadToCadence, errForLeadToCadence] = await Repository.fetchAll({
    tableName: DB_TABLES.LEADTOCADENCE,
    query: {
      status: CADENCE_LEAD_STATUS.PAUSED,
      unix_resume_at: {
        [Op.lte]: endTime,
      },
    },
    include: {
      [DB_TABLES.LEAD]: {
        attributes: ['lead_id', 'user_id'],
      },
    },
    extras: {
      attributes: ['lead_cadence_id', 'cadence_id'],
    },
  });
  if (errForLeadToCadence) return [null, errForLeadToCadence];

  let recalculateForUsers = [];

  await Promise.all(
    leadToCadence.map((elem) => {
      // recalculate for users
      recalculateForUsers.push(elem?.Leads?.[0]?.user_id);
      return CadenceHelper.resumeCadenceForLead(elem?.Leads?.[0]?.lead_id, [
        elem.cadence_id,
      ]);
    })
  );
  // recalculate for users
  TaskHelper.recalculateDailyTasksForUsers([...new Set(recalculateForUsers)]);
};

module.exports = cronUpdateLeadToCadence;
