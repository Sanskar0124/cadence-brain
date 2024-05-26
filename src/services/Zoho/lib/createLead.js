// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createLead = async ({ access_token, instance_url, lead }) => {
  try {
    const { data } = await axios.post(`${instance_url}/crm/v4/Leads`, lead, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    if (err?.response?.data?.data?.[0]?.message) {
      if (
        err?.response?.data?.data?.[0]?.details &&
        (err?.response?.data?.data?.[0]?.code === 'INVALID_DATA' ||
          err?.response?.data?.data?.[0]?.code === 'DUPLICATE_DATA')
      ) {
        logger.error(
          `Error while creating lead in zoho: ${err?.response?.data?.data?.[0]?.message} : ${err?.response?.data?.data?.[0]?.details?.api_name}`
        );
        return [
          null,
          `${err?.response?.data?.data?.[0]?.message} : ${err?.response?.data?.data?.[0]?.details?.api_name}`,
        ];
      }
      logger.error(
        'Error while creating lead in zoho: ',
        err?.response?.data?.data?.[0]?.message
      );
      return [null, err?.response?.data?.data?.[0]?.message];
    } else if (err?.response?.data?.message) {
      logger.error(
        `Error while creating lead in zoho: `,
        err?.response?.data?.message
      );
      return [null, err?.response?.data?.message];
    }
    logger.error('Error while creating Lead in zoho: ', err);
    return [null, err.message];
  }
};

module.exports = createLead;
