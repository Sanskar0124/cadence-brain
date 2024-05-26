const logger = require('../../../utils/winston');
const axios = require('axios');

const getAllAccountsOfUserFromSalesforce = async (
  ownerId,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/query?q=SELECT Id  FROM Account WHERE ownerId = '${ownerId}'`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while fetching account from salesforce: ${err.message}`
    );
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = { getAllAccountsOfUserFromSalesforce };
