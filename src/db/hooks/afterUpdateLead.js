//Utils
const logger = require('../../utils/winston');

//Repository
const Repository = require('../../../src/repository');

//Enums
const {
  WORKFLOW_TRIGGERS,
  LEAD_INTEGRATION_TYPES,
} = require('../../../src/utils/enums');
const { DB_MODELS, DB_TABLES } = require('../../../src/utils/modelEnums');

//Helpers
const WorkflowHelper = require('../../../src/helper/workflow');

const afterUpdateLead = () => {
  try {
    const modelName = DB_MODELS[DB_TABLES.LEAD];
    modelName.afterBulkUpdate(async (update) => {
      if (update.fields?.includes('integration_status')) {
        const [leads, errForLead] = await Repository.fetchAll({
          tableName: DB_TABLES.LEAD,
          query: update.where,
          include: {
            [DB_TABLES.LEADTOCADENCE]: {
              attributes: ['cadence_id'],
            },
          },
          attributes: ['lead_id', 'integration_type'],
        });
        if (errForLead) {
          logger.error('Error while fetching lead:', errForLead);
          return [null, errForLead];
        }
        leads.forEach((lead) =>
          lead.LeadToCadences.forEach((link) => {
            if (
              lead.integration_type ===
                LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT ||
              lead.integration_type ===
                LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT ||
              lead.integration_type === LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT
            ) {
              WorkflowHelper.applyWorkflow({
                trigger:
                  WORKFLOW_TRIGGERS.WHEN_A_CONTACT_INTEGRATION_STATUS_IS_UPDATED,
                cadence_id: link.cadence_id,
                lead_id: lead.lead_id,
                extras: {
                  lead_status: update.attributes.integration_status,
                },
              });
            } else if (
              lead.integration_type ===
              LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE
            ) {
              WorkflowHelper.applyWorkflow({
                trigger:
                  WORKFLOW_TRIGGERS.WHEN_A_CANDIDATE_INTEGRATION_STATUS_IS_UPDATED,
                cadence_id: link.cadence_id,
                lead_id: lead.lead_id,
                extras: {
                  lead_status: update.attributes.integration_status,
                },
              });
            } else {
              WorkflowHelper.applyWorkflow({
                trigger:
                  WORKFLOW_TRIGGERS.WHEN_A_LEAD_INTEGRATION_STATUS_IS_UPDATED,
                cadence_id: link.cadence_id,
                lead_id: lead.lead_id,
                extras: {
                  lead_status: update.attributes.integration_status,
                },
              });
            }
          })
        );
      }
    });
    return ['after Lead Update hook applied', null];
  } catch (err) {
    logger.error('Error while invoking afterUpdate Lead hook:', err);
    return [null, err.message];
  }
};
module.exports = afterUpdateLead;
