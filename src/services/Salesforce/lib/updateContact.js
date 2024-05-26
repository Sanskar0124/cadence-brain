const logger = require('../../../utils/winston');
const axios = require('axios').default;
const cleanRequestBody = require('../utils/cleanRequestBody');

const updateContact = async (
  sfContactId,
  contact,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Contact/${sfContactId}`;

    const res = await axios.patch(URL, cleanRequestBody(contact), {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (res.status === 204) return [true, null];
    else throw new Error(res.data);
  } catch (err) {
    logger.error(`Error while updating contact in salesforce: ${err.message}`);
    logger.error(JSON.stringify(err.response?.data[0], null, 4));
    return [null, err.response?.data[0]?.message];
  }
};

module.exports = { updateContact };
