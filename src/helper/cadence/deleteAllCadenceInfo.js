// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');
const { sequelize } = require('../../db/models');

// Helpers
const deleteAllLeadInfo = require('../lead/deleteAllLeadInfo');

/**
 * @param {Integer} cadence_id
 * @param {Array} lead_ids
 */

const deleteAllCadenceInfo = async ({ cadence_id, lead_ids }) => {
  let t = await sequelize.transaction();
  try {
    if (lead_ids?.length) {
      deleteAllLeadInfo({ leadIds: lead_ids });
    }

    // delete cadence
    const cadencePromise = Repository.destroy({
      tableName: DB_TABLES.CADENCE,
      query: { cadence_id },
      t,
    });

    // delete cadence_schedule if exists
    const cadenceSchedulePromise = Repository.destroy({
      tableName: DB_TABLES.CADENCE_SCHEDULE,
      query: { cadence_id },
      t,
    });

    // delete all cadence nodes
    const cadenceNodesPromise = Repository.destroy({
      tableName: DB_TABLES.NODE,
      query: { cadence_id },
      t,
    });

    // delete all cadence workflows
    const cadenceWorkflowsPromise = Repository.destroy({
      tableName: DB_TABLES.WORKFLOW,
      query: { cadence_id },
      t,
    });

    const [
      [__, errForDeleteCadence],
      [____, errForDeleteCadenceSchedule],
      [_____, errForDeleteCadenceNodes],
      [______, errForDeleteCadenceWorkflows],
    ] = await Promise.all([
      cadencePromise,
      cadenceSchedulePromise,
      cadenceNodesPromise,
      cadenceWorkflowsPromise,
    ]);

    if (
      errForDeleteCadence ||
      errForDeleteCadenceSchedule ||
      errForDeleteCadenceNodes ||
      errForDeleteCadenceWorkflows
    ) {
      t.rollback();
      let errMsg =
        errForDeleteCadence ||
        errForDeleteCadenceSchedule ||
        errForDeleteCadenceNodes ||
        errForDeleteCadenceWorkflows;
      logger.error(`Error while deleting cadence: ${errMsg}`);
      return [null, errMsg];
    }

    t.commit();
    return ['Deleted all cadence info from db successfully.', null];
  } catch (err) {
    t.rollback();
    logger.error(`Error while deleting cadence: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = deleteAllCadenceInfo;
