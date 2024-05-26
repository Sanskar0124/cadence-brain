const axios = require('axios');

// * Util Imports
const logger = require('../../../utils/winston');

const createPerson = async ({ access_token, instance_url, person }) => {
  try {
    const { data } = await axios.post(`${instance_url}/v1/persons`, person, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error('Error while creating person in pipedrive: ', err);
    return [null, err.message];
  }
};

module.exports = createPerson;
