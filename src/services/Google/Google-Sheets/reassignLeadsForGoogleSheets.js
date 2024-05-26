// Utils
const logger = require('../../../utils/winston');
const { DB_TABLES, DB_MODELS } = require('../../../utils/modelEnums');
const {
  CRM_INTEGRATIONS,
  USER_INTEGRATION_TYPES,
  WORKFLOW_TRIGGERS,
  ACTIVITY_TYPE,
} = require('../../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../../db/models');

// Repository
const Repository = require('../../../repository');

// Helpers and Services
const getSheet = require('./getSheet');
const WorkflowHelper = require('../../../helper/workflow');
const ActivityHelper = require('../../../helper/activity');

const reassignLeadsForGoogleSheets = async ({
  leadsForUser,
  reassignToUser,
  googleSheetsFieldMap,
}) => {
  try {
    let promise_array = [];
    leadsForUser.forEach(async (lead) => {
      const [leadForCadence, errForLead] = await Repository.fetchOne({
        tableName: DB_TABLES.LEAD,
        query: { lead_id: lead.lead_id },
        include: {
          [DB_TABLES.LEADTOCADENCE]: {
            include: [DB_MODELS.cadence],
          },
          [DB_TABLES.USER]: {},
        },
      });
      if (errForLead) return [null, errForLead];
      let cadences = [];
      leadForCadence.LeadToCadences.forEach((lead) => {
        cadences = cadences.concat(lead.Cadences);
      });
      for (let i = 0; i < cadences.length; i++) {
        let cadence = cadences[i];
        const [gsLeads, errForGsLeads] = await getSheet(
          cadence.salesforce_cadence_id
        );

        if (errForGsLeads) continue;
        const gsLead = await gsLeads.find((row) => {
          return row[googleSheetsFieldMap.lead_id] == lead.lead_id;
        });
        gsLead[googleSheetsFieldMap.owner_integration_id] =
          reassignToUser?.integration_id;
        promise_array.push(gsLead);
      }
      const [_, errForUpdate] = await Repository.update({
        tableName: DB_TABLES.LEAD,
        updateObject: {
          user_id: reassignToUser.user_id,
        },
        query: {
          lead_id: lead.lead_id,
        },
      });

      WorkflowHelper.applyWorkflow({
        trigger: WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
        lead_id: lead.lead_id,
        extras: {
          crm: CRM_INTEGRATIONS.GOOGLE_SHEETS,
          integration_id: reassignToUser.integration_id,
          new_user_id: reassignToUser.user_id,
          oldOwnerSdId: leadForCadence?.User.sd_id,
        },
      });

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.OWNER_CHANGE,
          variables: {
            crm: CRM_INTEGRATIONS.GOOGLE_SHEETS,
          },
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
          },
        });
      ActivityHelper.activityCreation(
        activityFromTemplate,
        reassignToUser.user_id
      );

      if (errForUpdate) return;
      promise_array = promise_array.map((gsLead) => {
        gsLead.save();
      });
      await Promise.all(promise_array);
    });

    return ['Reassignment Successful.', null];
  } catch (err) {
    //t.rollback();
    logger.error(`Error while reassigning leads for google sheets: `, err);
    return [null, err.message];
  }
};

module.exports = reassignLeadsForGoogleSheets;
