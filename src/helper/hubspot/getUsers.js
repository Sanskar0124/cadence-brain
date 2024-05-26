// * Utils
const logger = require('../../utils/winston');

// * Packaged
const axios = require('axios');

const getUsers = async ({ access_token, pagingToken }) => {
  try {
    let endpoint = `https://api.hubapi.com/crm/v3/owners/?limit=100`;

    if (pagingToken) endpoint += `&after=${pagingToken}`;

    let { data } = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `An error occurred while fetching users from hubspot: ${
        JSON.stringify(err?.response?.data) || ''
      }`,
      err
    );
    if (err?.response?.data) return [null, JSON.stringify(err.response.data)];
    return [false, err.message];
  }
};

module.exports = getUsers;
