// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const query = async (query, access_token, instance_url) => {
  try {
    let URL = `${instance_url}/services/data/v52.0/query?q=${query}`;
    URL = encodeURI(URL);
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while running SOQL query in salesforce: ${err.message}`
    );
    console.log(err.response.data);
    return [null, err.message];
  }
};

module.exports = { query };
