// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

// Helpers and Services
const JsonHelper = require('../../../helper/json');

const searchCompany = async ({
  access_token,
  instance_url,
  search_term,
  fields = ['name'],
  limit = 1,
}) => {
  try {
    const body = {
      query: search_term,
      properties: [...fields],
      limit,
    };
    const { data } = await axios.post(
      `${instance_url}/crm/v3/objects/companies/search`,
      JsonHelper.clean(body),
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [data ?? [], null];
  } catch (err) {
    if (err?.response?.data) {
      logger.error(
        `Error while searching company in hubspot: ${err?.response?.data?.message}`
      );
      return [null, err?.response?.data?.message];
    }
    logger.error(`Error while searching company in hubspot: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = searchCompany;
