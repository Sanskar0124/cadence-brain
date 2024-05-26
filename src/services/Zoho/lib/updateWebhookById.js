// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');

// Helpers and Services
const { updateWebhook } = require('../../../grpc/v2/crm-integration');

const updateWebhookByID = async ({
  access_token,
  instance_url,
  channel_id,
  channel_expiry,
}) => {
  try {
    const [data, errUpdatingWebhook] = await updateWebhook({
      integration_type: CRM_INTEGRATIONS.ZOHO,
      integration_data: {
        access_token,
        instance_url,
        channel_id,
        channel_expiry,
      },
    });
    if (errUpdatingWebhook) return [null, errUpdatingWebhook];
    logger.info(`Webhook updated.`);
    return [true, null];
  } catch (err) {
    if (err?.response?.data?.data[0]?.message) {
      logger.error(
        `Error while updating webhook for zoho: `,
        err?.response?.data?.data[0]?.message
      );
      return [null, err?.response?.data?.data[0]?.message];
    }
    logger.error(`Error while updating webhook for zoho: `, err);
    return [null, err.message];
  }
};

module.exports = updateWebhookByID;
