// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');
const {
  PIPEDRIVE_HTTP_USERNAME,
  PIPEDRIVE_HTTP_PASSWORD,
} = require('../../../utils/constants');

// Helpers and Services
const { addWebhook } = require('../../../grpc/v2/crm-integration');

const addWebhookForObject = async ({
  access_token,
  instance_url,
  subscription_url,
  event_action = '*',
  event_object = '*',
}) => {
  try {
    const [data, err] = await addWebhook({
      integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
      integration_data: {
        access_token,
        instance_url,
        event_action,
        event_object,
        subscription_url,
        http_auth_user: PIPEDRIVE_HTTP_USERNAME,
        http_auth_password: PIPEDRIVE_HTTP_PASSWORD,
      },
    });
    if (err) return [null, err];
    logger.info(`Webhook created.`);
    return [true, null];
  } catch (err) {
    logger.error(`Error while adding webhook for pipedrive: `, err);
    return [null, err.message];
  }
};

module.exports = addWebhookForObject;
