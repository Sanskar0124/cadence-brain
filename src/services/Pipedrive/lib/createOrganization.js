const axios = require('axios');

// * Util Imports
const logger = require('../../../utils/winston');

const createOrganization = async ({
  access_token,
  instance_url,
  organization,
}) => {
  try {
    const { data } = await axios.post(
      `${instance_url}/v1/organizations`,
      organization,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [data, null];
  } catch (err) {
    logger.error('Error while creating organization in pipedrive: ', err);
    return [null, err.message];
  }
};

module.exports = createOrganization;
