const logger = require('../../../utils/winston');
const axios = require('axios');

const getContact = async (
  salesforce_contact_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Contact/${salesforce_contact_id}`;
    console.log(URL);
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching contact in salesforce: `, err);
    return [null, err.message];
  }
};

module.exports = { getContact };
