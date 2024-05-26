// Utils
const logger = require('../../../utils/winston');
const {
  HIRING_INTEGRATIONS,
  BULLHORN_ENDPOINTS,
} = require('../../../utils/enums');

// Helpers and Services
const { deleteWebhook } = require('../../../grpc/v2/hiring-integration');

const deleteWebhooks = async ({ access_token, instance_url, object }) => {
  try {
    const [data, errAddingWebhook] = await deleteWebhook({
      integration_type: HIRING_INTEGRATIONS.BULLHORN,
      integration_data: {
        access_token,
        instance_url,
        object,
      },
    });
    if (errAddingWebhook) return [null, errAddingWebhook];
    logger.info(`Webhook deleted for bullhorn`);
    return [true, null];
  } catch (err) {
    logger.error(`Error while deleting webhook for bullhorn: `, err);
    return [null, err.message];
  }
};

module.exports = deleteWebhooks;
