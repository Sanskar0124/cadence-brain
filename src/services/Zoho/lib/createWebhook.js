// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');

// Helpers and Services
const { addWebhook } = require('../../../grpc/v2/crm-integration');

const createWebhook = async ({
  access_token,
  instance_url,
  notify_url,
  events,
  channel_id,
  channel_expiry,
}) => {
  try {
    const [data, errAddingWebhook] = await addWebhook({
      integration_type: CRM_INTEGRATIONS.ZOHO,
      integration_data: {
        access_token,
        instance_url,
        events,
        notify_url,
        channel_id,
        channel_expiry,
      },
    });
    if (errAddingWebhook) return [null, errAddingWebhook];
    logger.info(`Webhook created.`);
    return [true, null];
  } catch (err) {
    logger.error(`Error while adding webhook for zoho: `, err);
    return [null, err.message];
  }
};

module.exports = createWebhook;
