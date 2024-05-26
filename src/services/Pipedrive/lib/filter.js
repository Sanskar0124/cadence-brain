// * Package Imports
const axios = require('axios');

// * Util Imports
const logger = require('../../../utils/winston');

const createFilter = async ({ access_token, instance_url, conditions }) => {
  try {
    const { data } = await axios.post(
      `${instance_url}/v1/filters`,
      conditions,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [data, null];
  } catch (err) {
    logger.error(`An error occurred while creating a Pipedrive filter`);
    return [null, err];
  }
};

const deleteFilter = async ({ access_token, instance_url, filter_id }) => {
  try {
    const { data } = await axios.delete(
      `${instance_url}/v1/filters/${filter_id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [data, null];
  } catch (err) {
    logger.error(
      `An error occurred while attempting to delete filter in Pipedrive: `,
      err
    );
    return [null, err];
  }
};

module.exports = {
  createFilter,
  deleteFilter,
};
