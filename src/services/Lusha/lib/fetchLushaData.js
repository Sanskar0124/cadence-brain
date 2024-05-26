const logger = require('../../../utils/winston');
const axios = require('axios');

const { LUSHA_API_URL } = require('../../../utils/config');

const fetchLushaData = async ({
  first_name,
  last_name,
  account_name,
  linkedin_url,
  lusha_api_key,
}) => {
  try {
    if (!first_name || !last_name || !account_name) {
      const msg = 'Essential Contact details missing for Lusha';
      logger.error(msg);
      return [null, msg];
    }

    let URL = `${LUSHA_API_URL}/person?`;

    if (first_name) URL += `firstName=${first_name}`;
    if (last_name) URL += `&lastName=${last_name}`;
    if (account_name) URL += `&company=${account_name}`;
    if (linkedin_url) URL += `&linkedinUrl=${linkedin_url}`;

    const url = encodeURI(URL);
    const { data } = await axios.get(url, {
      headers: {
        api_key: lusha_api_key,
      },
    });

    return [data?.data, null];
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message;
    logger.error(`Error while fetching data from LUSHA: `, msg);
    return [null, msg];
  }
};

module.exports = { fetchLushaData };
