// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createCompanyAddress = async ({
  access_token,
  instance_url,
  company,
  company_id,
}) => {
  try {
    const { data } = await axios.post(
      `${instance_url}/companies/${company_id}/addresses`,
      company,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while creating address for a company : ${
        err?.response?.data?.error?.message || err.message
      }`
    );
    return [null, err?.response?.data?.error?.message || err.message];
  }
};

module.exports = createCompanyAddress;
