// Util Imports
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');

// Packages
const axios = require('axios');

// Helpers and Services
const { addWebhook } = require('../../../grpc/v2/crm-integration');

const getWebhookEvents = async ({ access_token }) => {
  try {
    const { data } = await axios.get(
      `https://api.sellsy.com/v2/webhooks/events`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const response = data
      .filter((item) =>
        ['client', 'prospect', 'people', 'third_party_contact'].includes(
          item.id
        )
      )
      .flatMap((item) => {
        if (item.id === 'third_party_contact') {
          return [
            { id: `${item.id}.created`, is_enabled: true },
            { id: `${item.id}.deleted`, is_enabled: true },
          ];
        } else {
          return [
            { id: `${item.id}.updated`, is_enabled: true },
            { id: `${item.id}.created`, is_enabled: true },
            { id: `${item.id}.deleted`, is_enabled: true },
          ];
        }
      });

    return [response, null];
  } catch (err) {
    const errorMessage = err?.response?.data?.error?.message || err?.message;
    logger.error(
      'Error while fetching webhook events from sellsy: ',
      errorMessage
    );
    return [null, errorMessage];
  }
};

const createWebhook = async ({ access_token, endpoint }) => {
  try {
    const [config, errForConfig] = await getWebhookEvents({ access_token });
    if (errForConfig) return [null, errForConfig];

    const [data, err] = await addWebhook({
      integration_type: CRM_INTEGRATIONS.SELLSY,
      integration_data: {
        access_token: access_token,
        endpoint: endpoint,
        type: 'http',
        configuration: config,
      },
    });
    if (err) return [null, err];
    logger.info(`Webhook created.`);
    return [true, null];
  } catch (err) {
    logger.error('Error while creating webhook in Sellsy: ', err);
    return [null, err.message];
  }
};

module.exports = createWebhook;
