// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');
const { SELLSY_WEBHOOK } = require('../../../utils/config');

// Helpers and Services
const {
  getWebhooks,
  deleteWebhook,
} = require('../../../grpc/v2/crm-integration');

const deleteWebhookById = async ({ access_token }) => {
  try {
    let [data, err] = await getWebhooks({
      integration_type: CRM_INTEGRATIONS.SELLSY,
      integration_data: { access_token },
    });

    if (Array.isArray(data)) {
      for (let webhook of data) {
        if ([webhook?.endpoint].includes(SELLSY_WEBHOOK)) {
          // delete webhook
          const [data, err] = await deleteWebhook({
            integration_type: CRM_INTEGRATIONS.SELLSY,
            integration_data: {
              access_token,
              webhook_id: webhook?.id,
            },
          });
        }
      }
    }

    await logger.info(`Webhook deleted.`);
    return [true, null];
  } catch (err) {
    logger.error(`Error while deleting webhook for Sellsy: `, err);
    return [null, err.message];
  }
};

module.exports = deleteWebhookById;
