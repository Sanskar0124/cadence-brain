const logger = require('../../../utils/winston');
const axios = require('axios');

const updateContactOwner = async (
  salesforce_contact_id,
  owner_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Contact/${salesforce_contact_id}`;
    const { data } = await axios.patch(
      URL,
      {
        OwnerId: owner_id,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [data, null];
  } catch (err) {
    logger.error(`Error while updateing contact in salesforce: ${err.message}`);
    console.log(err?.response?.data);
    return [null, err.message];
  }
};

module.exports = { updateContactOwner };
