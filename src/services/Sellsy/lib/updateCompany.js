// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const updateCompany = async ({ access_token, instance_url, company_id, company }) => {
  try {
    const { data } = await axios.put(
      `${instance_url}/companies/${company_id}`,
      company,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [data, null];
  } catch (err) {
    console.log(err)
    logger.error('Error while updating Company in sellsy: ', err);
    return [null, err.message];
  }
};

module.exports = updateCompany;
