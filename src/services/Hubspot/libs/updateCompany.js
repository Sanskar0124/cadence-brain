// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const createCompany = async ({
  access_token,
  instance_url,
  company,
  company_id,
}) => {
  try {
    const { data } = await axios.patch(
      `${instance_url}/crm/v3/objects/companies/${company_id}`,
      company,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [data, null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        `Error while updating company in hubspot: ${err?.response?.data?.message}`
      );
      return [null, err?.response?.data?.message];
    }
    logger.error(`Error while updating company in hubspot: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = createCompany;
