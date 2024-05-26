// Utils
const logger = require('../utils/winston');

// Models
const { Company_Tokens } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const getCompanyTokens = async (query) => {
  try {
    const companyTokens = await Company_Tokens.findOne({
      where: query,
    });
    return [JsonHelper.parse(companyTokens), null];
  } catch (err) {
    logger.error(`Error while fetching company tokens: ${err.message}`);
    return [null, err.message];
  }
};

const updateCompanyTokens = async (query, companyTokens) => {
  try {
    const updatedCompanyTokens = await Company_Tokens.update(companyTokens, {
      where: query,
    });
    return [JsonHelper.parse(updatedCompanyTokens), null];
  } catch (err) {
    logger.error(`Error while updating company tokens: ${err.message}`);
    return [null, err.message];
  }
};

module.exports = {
  getCompanyTokens,
  updateCompanyTokens,
};
