// Utils
const logger = require('../utils/winston');

// Models
const { User, Company, Company_Settings } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

const createCompanySettings = async (
  company_id,
  change_contact_owners_when_account_change = 0,
  change_account_and_contact_when_contact_change = 0
) => {
  try {
    const createdCompanySettings = await Company_Settings.create({
      company_id,
      change_contact_owners_when_account_change,
      change_account_and_contact_when_contact_change,
    });
    return [JsonHelper.parse(createdCompanySettings), null];
  } catch (err) {
    logger.error(`Error while creating company settings: ${err.message}`);
    return [null, err.message];
  }
};

const getCompanySettingsByQuery = async (query) => {
  try {
    const settings = await Company_Settings.findOne({ where: query });
    return [JsonHelper.parse(settings), null];
  } catch (err) {
    logger.error(`Error while fetching company settings: ${err.message}`);
    return [null, err.message];
  }
};

const updateCompanySettingsByQuery = async (query, company_settings) => {
  try {
    const settings = await Company_Settings.update(company_settings, {
      where: query,
    });
    return [JsonHelper.parse(settings), null];
  } catch (err) {
    logger.error(`Error while updating company settings: ${err.message}`);
    return [null, err.message];
  }
};

const getCompanySettingByUser = async (query) => {
  try {
    const user = await User.findOne({
      where: query,
      attributes: ['user_id'],
      include: [
        {
          model: Company,
          attributes: ['company_id'],
          include: [
            {
              model: Company_Settings,
              attributes: [
                'unsubscribe_link_madatory_for_semi_automated_mails',
                'unsubscribe_link_madatory_for_automated_mails',
                'default_unsubscribe_link_text',
              ],
            },
          ],
        },
      ],
    });

    return [JSON.parse(JSON.stringify(user)), null];
  } catch (err) {
    logger.error(`Error while finding user by query: ${err.message}.`);
    return [null, err.message];
  }
};

const CompanySettingsRepository = {
  createCompanySettings,
  getCompanySettingsByQuery,
  updateCompanySettingsByQuery,
  getCompanySettingByUser,
};

module.exports = CompanySettingsRepository;
