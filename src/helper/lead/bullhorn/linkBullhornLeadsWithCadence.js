// Utils
const logger = require('../../../utils/winston');
const {
  LEAD_TYPE,
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  SALESFORCE_SOBJECTS,
  ACCOUNT_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
} = require('../../../utils/enums');
const { DB_TABLES } = require('../../../utils/modelEnums');

// Repository
const Repository = require('../../../repository');

// Helpers and services
const stopCadenceForLead = require('../stopCadenceForLead');
const hasLeadUnsubscribed = require('../hasLeadUnsubscribed');
const CadenceHelper = require('../../cadence');
const TaskHelper = require('../../task');
const ImportHelper = require('../../imports');
const { FRONTEND_URL } = require('../../../utils/config');

const linkBullhornLeadWithCadence = async ({
  integration_id,
  company_id,
  lead_cadence_order,
  stopPreviousCadences,
  node,
  cadence,
}) => {
  try {
    const [lead, err] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { integration_id, company_id },
      include: {
        [DB_TABLES.LEADTOCADENCE]: {},
        [DB_TABLES.USER]: {
          attributes: ['user_id', 'sd_id', 'company_id'],
          [DB_TABLES.SUB_DEPARTMENT]: {
            attributes: ['name'],
          },
        },
      },
    });
    if (!lead) {
      return [
        null,
        {
          error: 'Lead does not exist',
          integration_id,
        },
      ];
    }

    // * Check if lead is already present in cadence
    let [leadToCadence, errFetchingLeadToCadence] = await Repository.fetchOne({
      tableName: DB_TABLES.LEADTOCADENCE,
      query: {
        lead_id: lead.lead_id,
        cadence_id: cadence.cadence_id,
      },
    });
    if (errFetchingLeadToCadence)
      return [
        null,
        {
          error: errFetchingLeadToCadence,
          integration_id,
        },
      ];
    if (leadToCadence)
      return [
        null,
        {
          error: `Lead is already present in <a href = "${FRONTEND_URL}/crm/cadence/${cadence.cadence_id}?view=list&search=${lead.full_name}&lead_id=${lead.lead_id}" target = "_blank"><strong>${cadence.name}</strong><a>`,
          integration_id,
        },
      ];

    if (stopPreviousCadences) {
      // * Stop all cadences of lead
      // * Fetch cadences to
      let cadence_ids = [];

      for (let leadToCadence of lead.LeadToCadences)
        cadence_ids.push(leadToCadence.cadence_id);

      stopCadenceForLead(lead, cadence_ids);
    }

    // * Check if user has access to cadence
    let [hasAccess, errCheckingAccess] = ImportHelper.checkCadenceAccess({
      cadence,
      user: lead.User,
    });
    if (errCheckingAccess)
      return [null, { error: errCheckingAccess, integration_id }];

    // * Check if lead has unsubscribed
    let [unsubscribed, ___] = await hasLeadUnsubscribed(lead.lead_id);

    // * Create Link
    const [createdLink, errForLink] = await Repository.create({
      tableName: DB_TABLES.LEADTOCADENCE,
      createObject: {
        lead_id: lead.lead_id,
        cadence_id: cadence.cadence_id,
        status: cadence?.status,
        unsubscribed: unsubscribed ?? false,
        lead_cadence_order,
      },
    });

    // * If cadence is in progress, start it.
    if (cadence?.status === CADENCE_STATUS.IN_PROGRESS) {
      if (node) {
        const [taskCreated, errForTaskCreated] =
          await CadenceHelper.launchCadenceForLead(
            lead,
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
          TaskHelper.recalculateDailyTasksForUsers([lead.user_id]);
      }
    }

    return [
      {
        msg: 'Lead added to cadence successfully',
        integration_id: integration_id,
        lead_id: lead.lead_id,
      },
      null,
    ];
  } catch (err) {
    logger.error('An error occurred while linking lead with cadence', err);
    return [null, { error: err.message, integration_id }];
  }
};

module.exports = linkBullhornLeadWithCadence;
