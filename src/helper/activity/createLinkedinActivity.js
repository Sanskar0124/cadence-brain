// Utils
const logger = require('../../utils/winston');
const { ACTIVITY_TYPE } = require('../../utils/enums');

// Helpers and Services
const { activityCreation } = require('./activityCreation');
const getActivityFromTemplates = require('./getActivityFromTemplates');

const getLinkedinActivityName = (lead, type) => {
  try {
    switch (type) {
      case ACTIVITY_TYPE.LINKEDIN_CONNECTION:
        return [
          `You have sent LinkedIn connection request to ${lead.first_name} ${lead.last_name}.`,
          null,
        ];
      case ACTIVITY_TYPE.LINKEDIN_INTERACT:
        return [
          `You interacted with ${lead.first_name} ${lead.last_name} on LinkedIn.`,
          null,
        ];
      case ACTIVITY_TYPE.LINKEDIN_MESSAGE:
        return [
          ` You have messaged ${lead.first_name} ${lead.last_name} on LinkedIn.`,
          null,
        ];
      case ACTIVITY_TYPE.LINKEDIN_PROFILE:
        return [
          `You have viewed LinkedIn profile of ${lead.first_name} ${lead.last_name}.`,
          null,
        ];
      default:
        return [null, `Invalid Type.`];
    }
  } catch (err) {
    logger.error(
      `Error while fetching linkedin activity name: ${err.message}.`
    );
    return [null, err.message];
  }
};

const createLinkedinActivity = async ({
  lead,
  cadence_id,
  type,
  node_id,
  status,
}) => {
  try {
    const [name, errForName] = getLinkedinActivityName(lead, type);

    if (errForName) return [null, errForName];

    const [activityFromTemplate, errForActivityFromTemplate] =
      getActivityFromTemplates({
        type,
        variables: {
          lead_first_name: lead.first_name,
          lead_last_name: lead.last_name,
          message: status || '',
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
      return [
        null,
        `Error while creating linkedin activity: ${errForActivity}`,
      ];

    return [activity, null];
  } catch (err) {
    logger.error(`Error while creating linkedin activity: `, err);
    return [null, err.message];
  }
};

module.exports = createLinkedinActivity;
