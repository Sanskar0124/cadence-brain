const logger = require('../../../utils/winston');
const axios = require('axios');

const { KASPR_API_URL } = require('../../../utils/config');
const JsonHelper = require('../../../helper/json');
const LinkedinHelper = require('../../../helper/linkedin');

const fetchKasprData = async ({
  first_name,
  last_name,
  linkedin_url,
  kaspr_api_key,
}) => {
  try {
    let msg;

    if (!first_name) {
      msg = `First Name is must for Kaspr`;
      logger.error(msg);
      return [null, msg];
    }
    if (!last_name) {
      msg = `Last Name is must for Kaspr`;
      logger.error(msg);
      return [null, msg];
    }
    if (!linkedin_url) {
      msg = `Profile LinkedIn URL is must for Kaspr`;
      logger.error(msg);
      return [null, msg];
    }

    const [id, errLinkedinUrl] =
      LinkedinHelper.extractUsernameFromUrl(linkedin_url);
    if (errLinkedinUrl) return [null, errLinkedinUrl];

    const name = `${first_name} ${last_name}`;
    const body = {
      id,
      name,
      isPhoneRequired: true,
    };

    const { data } = await axios.post(KASPR_API_URL, JsonHelper.clean(body), {
      headers: {
        Authorization: `Bearer ${kaspr_api_key}`,
        'Content-type': 'application/json',
      },
    });

    return [data, null];
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message;
    logger.error(`Error while fetching data from KASPR: ${msg}`, err);
    return [null, msg];
  }
};

module.exports = { fetchKasprData };
