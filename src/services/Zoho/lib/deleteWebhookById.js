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
    let [data, errFetchingWebhook] = await getWebhooks({
      integration_type: CRM_INTEGRATIONS.ZOHO,
      integration_data: {
        access_token,
        instance_url,
      },
    });

    const webhooks = data?.watch;

    if (Array.isArray(webhooks)) {
      const lead_webhook = `${SERVER_URL}/v2/webhook/zoho/lead`;
      const account_webhook = `${SERVER_URL}/v2/webhook/zoho/account`;
      const contact_webhook = `${SERVER_URL}/v2/webhook/zoho/contact`;

      for (let webhook of webhooks) {
        if (
          [lead_webhook, account_webhook, contact_webhook].includes(
            webhook?.notify_url
          )
        ) {
          // delete webhook
          const [data, err] = await deleteWebhook({
            integration_type: CRM_INTEGRATIONS.ZOHO,
            integration_data: {
              access_token,
              instance_url,
              webhook_id: webhook?.channel_id,
            },
          });
        }
      }
    }

    await logger.info(`Webhook deleted.`);
    return [true, null];
  } catch (err) {
    logger.error(`Error while deleting webhook for zoho: `, err);
    return [null, err.message];
  }
};

module.exports = deleteWebhookById;
