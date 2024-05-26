//Enums
const { WORKFLOW_TRIGGERS } = require('../../../src/utils/enums');
const { DB_MODELS, DB_TABLES } = require('../../../src/utils/modelEnums');

//Repository
const Repository = require('../../repository');

//Helpers
const WorkflowHelper = require('../../../src/helper/workflow');
const logger = require('../../utils/winston');

const afterUpdateAccount = () => {
  try {
    const modelName = DB_MODELS[DB_TABLES.ACCOUNT];
    modelName.afterBulkUpdate(async (update) => {
      if (update.fields?.includes('integration_status')) {
        const [accounts, errForAccount] = await Repository.fetchAll({
          tableName: DB_TABLES.ACCOUNT,
          query: update.where,
          include: {
            [DB_TABLES.LEAD]: {
              attributes: ['lead_id'],
              [DB_TABLES.LEADTOCADENCE]: {
                attributes: ['cadence_id'],
              },
            },
          },
        });
        if (errForAccount) {
          logger.error('Error while fetching account:', errForAccount);
          return [null, errForAccount];
        }
        accounts.forEach((account) =>
          account.Leads.forEach((lead) =>
            lead.LeadToCadences.forEach((link) =>
              WorkflowHelper.applyWorkflow({
                trigger:
                  WORKFLOW_TRIGGERS.WHEN_A_ACCOUNT_INTEGRATION_STATUS_IS_UPDATED,
                cadence_id: link.cadence_id,
                lead_id: lead.lead_id,
                extras: {
                  lead_status: update.attributes.integration_status,
                },
              })
            )
          )
        );
      }
    });
    return ['after Account update hook applied', null];
  } catch (err) {
    logger.error('Error while invoking afterUpdate account hook:', err);
    return [null, err.message];
  }
};
module.exports = afterUpdateAccount;
