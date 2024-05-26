// Utils
const logger = require('../../utils/winston');
const { CADENCE_STATUS, CADENCE_LEAD_STATUS } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

// Helpers and services
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');
const CadenceHelper = require('../cadence');
const TaskHelper = require('../task');

const linkTempLead = async ({ lead, cadence, node }) => {
  try {
    const [fetchLead, errForFetchingLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: {
        lead_id: lead.lead_id,
      },
    });
    if (errForFetchingLead)
      return [null, `Error while fetching lead: ${errForFetchingLead}`];
    if (!fetchLead) return [null, `Lead not present in tool`];

    let [unsubscribed, ___] = await hasLeadUnsubscribed(fetchLead.lead_id);

    // Creating lead to cadence link
    const [createdLink, errForLink] = await Repository.create({
      tableName: DB_TABLES.LEADTOCADENCE,
      createObject: {
        lead_id: fetchLead.lead_id,
        cadence_id: cadence.cadence_id,
        status:
          lead.cadenceStatus === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        lead_cadence_order: lead.leadCadenceOrder,
        unsubscribed: unsubscribed ?? false,
      },
    });
    if (errForLink)
      return [null, { error: errForLink, preview_id: lead.preview_id }];

    fetchLead.lead_cadence_id = createdLink.lead_cadence_id;

    // * If cadence is in progress, start it.
    if (cadence?.status === CADENCE_STATUS.IN_PROGRESS) {
      if (node) {
        const [taskCreated, errForTaskCreated] =
          await CadenceHelper.launchCadenceForLead(
            fetchLead,
            cadence.cadence_id,
            node,
            lead.user_id,
            true
          );
        /*
         * recalculating after each task created,
         * since it is possible that we get many leads at once in this route
         * In that case tasks wont show up if we calculate after every lead is created
         * */
        if (taskCreated)
          TaskHelper.recalculateDailyTasksForUsers([fetchLead.user_id]);
      }
    }

    return [
      {
        msg: 'Link lead created successfully',
        preview_id: lead.preview_id,
        lead_id: fetchLead.lead_id,
      },
      null,
    ];
  } catch (err) {
    logger.error('Error while creating link temp lead: ', err);
    return [null, { error: err.message, preview_id: lead.preview_id }];
  }
};

module.exports = linkTempLead;
