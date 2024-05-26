const logger = require('../../utils/winston');

// Packages
const axios = require('axios');

const getDynamicsUser = async (authData) => {
  try {
    const { access_token, instance_url } = authData;
    const URL = `${instance_url}/api/data/v9.2/WhoAmI`;

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
    logger.error(`An error occurred while getting Dynamics user Id `, err);
    return [null, err.message];
  }
};

module.exports = getDynamicsUser;
