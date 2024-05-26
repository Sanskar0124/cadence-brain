// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const fetchValidEmail = async ({
  first_name,
  last_name,
  full_name,
  hunter_api_key,
  account_name = '',
  domain = '',
}) => {
  try {
    const URL = 'https://api.hunter.io/v2/email-finder';

    const res = await axios.get(URL, {
      params: {
        first_name,
        last_name,
        full_name: full_name ?? `${first_name} ${last_name}`,
        domain,
        company: account_name,
        api_key: hunter_api_key,
        max_duration: 10,
      },
    });

    const hunterData = res?.data?.data;

    if (hunterData?.email && hunterData?.verification?.status === 'valid')
      return [hunterData.email, null];

    return [null, `No valid email found using hunter.`];
  } catch (err) {
    logger.error(`Error while fetching valid emails from hunter: `, err);
    const msg = err?.response?.data?.errors?.[0].details ?? err.message;
    return [null, msg];
  }
};

module.exports = fetchValidEmail;
