// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE, CRM_INTEGRATIONS } = require('../../utils/enums');

// Helpers and Services
const { activityCreation } = require('./activityCreation');
const getActivityFromTemplates = require('./getActivityFromTemplates');

const createExportLeadActivity = async ({
  lead,
  crm_integration,
  exported_as,
}) => {
  try {
    const [activityFromTemplate, errForActivityFromTemplate] =
      getActivityFromTemplates({
        type: ACTIVITY_TYPE.EXPORTED_LEAD,
        variables: {
          crm: crm_integration,
          lead_first_name: lead?.first_name,
          lead_last_name: lead?.last_name,
          exported_as,
        },
        activity: {
          lead_id: lead.lead_id,
          incoming: null,
        },
      });

    const [activity, errForActivity] = await activityCreation(
      activityFromTemplate,
      lead.user_id
    );
    if (errForActivity)
      return [
        null,
        `Error while creating export lead activity: `,
        errForActivity,
      ];

    return [activity, null];
  } catch (err) {
    logger.error(`Error while creating export lead activity: `, err);
    return [null, err.message];
  }
};

module.exports = createExportLeadActivity;
