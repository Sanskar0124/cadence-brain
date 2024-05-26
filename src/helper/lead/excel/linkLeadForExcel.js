// Utils
const logger = require('../../../utils/winston');
const {
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  LEAD_INTEGRATION_TYPES,
} = require('../../../utils/enums');
const { DB_TABLES } = require('../../../utils/modelEnums');

// Repository
const Repository = require('../../../repository');

// Helpers and services
const CadenceHelper = require('../../cadence');
const TaskHelper = require('../../task');
const hasLeadUnsubscribed = require('../../lead/hasLeadUnsubscribed');

const linkLeadForExcel = async ({ lead, cadence, node }) => {
  try {
    let [fetchLead, errForFetchingLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id: lead.lead_id },
    });
    if (errForFetchingLead)
      return [null, `Error while fetching ${lead.lead_id}`];
    if (!fetchLead) return [null, `No lead found ${lead.lead_id}`];

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
      return [
        null,
        {
          error: errForLink,
          sr_no: lead.sr_no,
        },
      ];

    if (
      fetchLead.integration_type === LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD
    ) {
      let [updateLeadIntegrationType, errUpdatingLeadIntegrationType] =
        await Repository.update({
          tableName: DB_TABLES.LEAD,
          query: { lead_id: fetchLead.lead_id },
          updateObject: { integration_type: LEAD_INTEGRATION_TYPES.EXCEL_LEAD },
        });
      if (errUpdatingLeadIntegrationType)
        return [
          null,
          `Error while updating lead integration type: ${errUpdatingLeadIntegrationType}`,
        ];
    }

    fetchLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + fetchLead.lead_id);

    // * If cadence is in progress, start it.
    if (cadence?.status === CADENCE_STATUS.IN_PROGRESS) {
      if (node) {
        const [taskCreated, errForTaskCreated] =
          await CadenceHelper.launchCadenceForLead(
            fetchLead,
            lead.cadence_id,
            node,
            lead.user_id,
            true
          );
        /*
         * recalculating after each task created,
         * since it is possible that we get many leads at once in this route
         * In that case tasks wont show up if we calculate in the end after every lead is created
         * */
        if (taskCreated)
          TaskHelper.recalculateDailyTasksForUsers([fetchLead.user_id]);
      }
    }

    return [
      {
        sr_no: lead.sr_no,
        msg: 'Lead link created successfully',
        lead_cadence_id: fetchLead.lead_cadence_id,
        lead_id: fetchLead.lead_id,
      },
      null,
    ];
  } catch (err) {
    logger.error('An error occurred while creating lead link', err);
    return [
      null,
      {
        error: err.message,
        sr_no: lead.sr_no,
      },
    ];
  }
};

module.exports = linkLeadForExcel;
