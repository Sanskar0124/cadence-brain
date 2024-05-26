// Utils
const logger = require('../../utils/winston');

const {
  LEAD_STATUS,
  CADENCE_LEAD_STATUS,
  ACTIVITY_TYPE,
  LEAD_SCORE_RUBRIKS,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Helpers and services
const ActivityHelper = require('../activity');
const recalculateDailyTasksForUsers = require('../task/recalculateDailyTasksForUsers');
const LeadScoreHelper = require('../lead-score');
const leadIntegrationStatusHelper = async ({
  fieldMap,
  lead,
  body,
  previous_status,
}) => {
  try {
    if (
      body.status === fieldMap?.integration_status?.disqualified?.value &&
      fieldMap?.integration_status?.disqualified?.value !== undefined
    ) {
      // * Mark lead_status as trash
      await Repository.update({
        tableName: DB_TABLES.LEAD,
        query: { lead_id: lead.lead_id },
        updateObject: {
          status: LEAD_STATUS.TRASH,
          integration_status: body.status,
        },
      });
      await Repository.create({
        tableName: DB_TABLES.STATUS,
        createObject: {
          lead_id: lead.lead_id,
          status: LEAD_STATUS.TRASH,
        },
      });

      // * Stopping all tasks for lead
      await Repository.update({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: { lead_id: lead.lead_id },
        updateObject: {
          status: CADENCE_LEAD_STATUS.STOPPED,
        },
      });

      //get present date as per timezone
      const today = new Date().toLocaleDateString('en-GB', {
        timeZone: lead.User.timezone,
      });

      // * Generate acitvity
      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.LEAD_DISQUALIFIED,
          variables: {
            today,
          },
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
          },
        });

      ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);
      recalculateDailyTasksForUsers([lead.user_id]);

      // Lead Score
      let [leadScore, errForLeadScore] = await LeadScoreHelper.updateLeadScore({
        lead,
        rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
        current_status: body.status,
        previous_status,
        field_map: fieldMap,
      });
      if (errForLeadScore)
        logger.error(
          'An error occured while scoring lead during status update ',
          errForLeadScore
        );
    }

    // * Lead has been converted
    else if (
      body.status === fieldMap?.integration_status?.converted?.value &&
      fieldMap?.integration_status?.converted?.value !== undefined
    ) {
      // * Update lead status
      await Repository.update({
        tableName: DB_TABLES.LEAD,
        query: { lead_id: lead.lead_id },
        updateObject: {
          status: LEAD_STATUS.CONVERTED,
          integration_status: body.status,
        },
      });

      await Repository.create({
        tableName: DB_TABLES.STATUS,
        createObject: {
          lead_id: lead.lead_id,
          status: LEAD_STATUS.CONVERTED,
        },
      });

      await Repository.update({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: { lead_id: lead.lead_id },
        updateObject: {
          status: CADENCE_LEAD_STATUS.STOPPED,
        },
      });

      //get present date as per timezone
      const today = new Date().toLocaleDateString('en-GB', {
        timeZone: lead.User.timezone,
      });

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.LEAD_CONVERTED,
          variables: {
            today,
          },
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
          },
        });

      ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);
      recalculateDailyTasksForUsers([lead.user_id]);
      // ResetLead Score
      let [leadScore, errForLeadScore] = await LeadScoreHelper.updateLeadScore({
        lead,
        rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
        current_status: body.status,
        previous_status,
        resetScore: true,
      });
      if (errForLeadScore)
        logger.error(
          'An error occured while scoring lead during status update ',
          errForLeadScore
        );
    } else {
      // Update Lead Integration Status
      let [updatedLead, errForUpdatedLead] = await Repository.update({
        tableName: DB_TABLES.LEAD,
        query: { lead_id: lead.lead_id },
        updateObject: {
          integration_status: body.status,
        },
      });
      if (errForUpdatedLead) {
        logger.error(
          'Error while updating lead integration status',
          errForUpdatedLead
        );
      }

      // Increase the lead score
      let [leadScore, errForLeadScore] = await LeadScoreHelper.updateLeadScore({
        lead,
        rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
        current_status: body.status,
        previous_status,
        field_map: fieldMap,
      });
      if (errForLeadScore)
        logger.error(
          'An error occured while scoring lead during status update ',
          errForLeadScore
        );
    }
    return [true, null];
  } catch (err) {
    logger.error('Error while updating lead integration status ', err);
    return [null, err.message];
  }
};
module.exports = leadIntegrationStatusHelper;
