// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const fetchProfileData = async (linkedin_url, headers) => {
  try {
    if (!linkedin_url) return [null, `Empty profile received.`];
    if (!headers) return [null, 'Headers are required.'];

    // get url from people Urn
    const username = linkedin_url.split('/')[4];

    const URL = `https://www.linkedin.com/voyager/api/identity/profiles/${username}/profileView`;

    // get details from linkedin
    const res = await axios.get(URL, { headers });
    const data = res?.data;

    return [data, null];
  } catch (err) {
    if (err?.response?.data)
      return logger.error(
        `Error while fetching people details from linkedin: ${JSON.stringify(
          err?.response?.data
        )}`
      );
    else
      logger.error(`Error while fetching people details from linkedin: `, err);
    return [null, err.message];
  }
};

module.exports = fetchProfileData;
