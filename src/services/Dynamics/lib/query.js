// Packages
const logger = require('../../../utils/winston');
const axios = require('axios');

const query = async ({ query, access_token, instance_url }) => {
  try {
    let URL = `${instance_url}/api/data/v9.2/${query}`;

    const { data } = await axios.get(URL, {
      headers: {
        'If-None-Match': 'null',
        'OData-Version': '4.0',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'OData-MaxVersion': '4.0',
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while running ODATA query in dynamics: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = query;
