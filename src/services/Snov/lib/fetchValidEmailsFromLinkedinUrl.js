// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

// Helpers and Services
const fetchSnovToken = require('./fetchSnovToken');

const fetchValidEmailsFromLinkedinUrl = async ({
  linkedinUrl,
  snov_client_id,
  snov_client_secret,
}) => {
  try {
    // fetch snov token
    const [accessToken, errForAccessToken] = await fetchSnovToken(
      snov_client_id,
      snov_client_secret
    );
    if (errForAccessToken) return [null, errForAccessToken];

    const body = {
      access_token: accessToken,
      url: linkedinUrl,
    };

    // add url in snov
    let res = await axios.post(
      'https://api.snov.io/v1/add-url-for-search',
      body
    );
    if (!res.data?.success) {
      logger.error('Failed to add url in snov: ');
      logger.error(JSON.stringify(res.data, null, 4));
      return [null, 'Failed to fetch emails from Snov.'];
    }

    // get emails from snov
    res = await axios.post('https://api.snov.io/v1/get-emails-from-url', body);
    const snovData = res?.data;
    const emails = [];

    // fetch emails with validity
    let emailData = snovData?.data?.emails;

    if (emailData?.length)
      emailData.forEach((email) => {
        if (email.status === 'valid') emails.push(email.email);
      });

    if (!emails.length) return [null, 'Na valid emails found from Snov.'];

    return [emails, null];
  } catch (err) {
    logger.error(
      `Error while fetching valid emails from linkedin url using snov: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = fetchValidEmailsFromLinkedinUrl;
