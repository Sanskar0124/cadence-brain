// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');
const { SERVER_URL } = require('../../../utils/config');

// Helpers and Services
const {
  getWebhooks,
  deleteWebhook,
} = require('../../../grpc/v2/crm-integration');

const deleteWebhookById = async ({ access_token, instance_url }) => {
  try {
    let [data, err] = await getWebhooks({
      integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
      integration_data: {
        access_token,
        instance_url,
      },
    });

    const webhooks = data?.data;

    if (Array.isArray(webhooks)) {
      for (let webhook of webhooks) {
        if (webhook?.subscription_url.includes(SERVER_URL)) {
          // delete webhook
          const [data, err] = await deleteWebhook({
            integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
            integration_data: {
              access_token,
              instance_url,
              webhook_id: webhook?.id,
            },
          });
        }
      }
    }

    await logger.info(`Webhook deleted.`);
    return [true, null];
  } catch (err) {
    logger.error(`Error while deleting webhook for pipedrive: `, err);
    return [null, err.message];
  }
};

module.exports = deleteWebhookById;
