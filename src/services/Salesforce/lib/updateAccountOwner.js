const logger = require('../../../utils/winston');
const axios = require('axios');

const updateAccountOwner = async (
  salesforce_account_id,
  owner_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Account/${salesforce_account_id}`;
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
    logger.error(`Error while updating account in salesforce: ${err.message}`);
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = { updateAccountOwner };
