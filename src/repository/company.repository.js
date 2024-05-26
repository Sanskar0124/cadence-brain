// Utils
const logger = require('../utils/winston');

// Models
const { Company } = require('../db/models');

const createCompany = async (name, url, linkedin_url, location) => {
  try {
    const createdCompany = await Company.create({
      name,
      url,
      linkedin_url,
      location,
    });
    return [createdCompany, null];
  } catch (err) {
    logger.error(`Error while creating company: ${err.message}`);
    return [null, err];
  }
};

const getAllCompanies = async () => {
  try {
    const companies = await Company.findAll();
    return [companies, null];
  } catch (err) {
    logger.error(`Error while fetching company: ${err.message}`);
    return [null, err];
  }
};

const CompanyRepository = {
  createCompany,
  getAllCompanies,
};

module.exports = CompanyRepository;
