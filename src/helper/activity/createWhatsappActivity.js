// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE } = require('../../utils/enums');

// Helpers and Services
const { activityCreation } = require('./activityCreation');
const getActivityFromTemplates = require('./getActivityFromTemplates');

const createWhatsappActivity = async ({
  lead,
  cadence_id,
  type,
  node_id,
  message,
}) => {
  try {
    const [activityFromTemplate, errForActivityFromTemplate] =
      getActivityFromTemplates({
        type,
        variables: {
          lead_first_name: lead.first_name,
          lead_last_name: lead.last_name,
          message: message ?? '',
        },
        activity: {
          cadence_id,
          lead_id: lead.lead_id,
          incoming: null,
          node_id,
        },
      });

    const [activity, errForActivity] = await activityCreation(
      activityFromTemplate,
      lead.user_id
    );
    if (errForActivity)
      return [null, `Error while creating whatsapp activity: `, errForActivity];

    return [activity, null];
  } catch (err) {
    logger.error(`Error while creating whatsapp activity: `, err);
    return [null, err.message];
  }
};

module.exports = createWhatsappActivity;
