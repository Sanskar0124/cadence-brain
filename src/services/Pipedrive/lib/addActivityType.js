// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');

// Helpers and Services
const {
  fetchActivityTypes,
  deleteActivityType,
  createActivityType,
} = require('../../../grpc/v2/crm-integration');

const addActivityType = async ({
  access_token,
  instance_url,
  name,
  icon_key,
  color = '189AB4',
}) => {
  try {
    let [activityTypes, errForActivityTypes] = await fetchActivityTypes({
      integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
      integration_data: {
        access_token,
        instance_url,
      },
    });

    activityTypes = activityTypes?.data || [];

    for (let activityType of activityTypes) {
      if (activityType.name === name) {
        logger.info('Activity type already exists.');
        logger.info('Deleting it...');
        const [data, err] = await deleteActivityType({
          integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
          integration_data: {
            access_token,
            instance_url,
            id: activityType.id,
          },
        });
        logger.info('Deleted.');
      }
    }

    const [add, errForAdd] = await createActivityType({
      integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
      integration_data: {
        access_token,
        instance_url,
        name,
        icon_key,
        color,
      },
    });
    if (errForAdd) return [null, errForAdd];
    return ['Added activity type.', null];
  } catch (err) {
    logger.error(`Error while adding activity type: `, err);
    return [null, err.message];
  }
};

module.exports = addActivityType;
