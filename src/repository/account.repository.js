// Utils
const logger = require('../utils/winston');

// Models
const { Op } = require('sequelize');
const { Account, Lead, LeadToCadence, User } = require('../db/models');

const findOrCreateAccount = async ({
  name,
  size,
  country,
  zip_code,
  url,
  linkedin_url,
  phone_number,
  salesforce_account_id,
  user_id,
}) => {
  try {
    logger.info('Checking if Account exists...');
    const account = await Account.findOne({
      where: {
        name: name,
      },
    });
    if (!account) {
      logger.info('Account does not exists.');
      const createdAccount = await Account.create({
        name,
        size,
        country,
        zipcode: zip_code,
        url,
        linkedin_url,
        phone_number,
        salesforce_account_id,
        user_id,
      });
      logger.info('Created Account successfully.', createdAccount);
      return [parseInt(createdAccount.account_id), null];
    } else {
      const updatedAccount = await Account.update(
        {
          size,
          country,
          url,
          linkedin_url,
          phone_number,
          salesforce_account_id,
        },
        { where: { account_id: account.dataValues.account_id } }
      );
    }
    logger.info('Account Exists.');
    return [parseInt(account.dataValues.account_id), null];
  } catch (err) {
    logger.error(`Error while finding or creating account: ${err.message}`);
    return [null, err.message];
  }
};

const getAllAccounts = async () => {
  try {
    const accounts = await Account.findAll();
    return [accounts, null];
  } catch (err) {
    logger.error(`Error while fetching all accounts: ${err.message}`);
    return [null, err.message];
  }
};

const fetchAccountByQuery = async (query) => {
  try {
    const account = await Account.findOne({
      where: query,
    });
    return [account, null];
  } catch (err) {
    logger.error(`Error while fetching account by query: ${err.message}`);
    return [null, err.message];
  }
};

const fetchAccountsByQuery = async (query) => {
  try {
    const accounts = await Account.findAll({
      where: query,
    });
    return [accounts, null];
  } catch (err) {
    logger.error(`Error while fetching accounts by query: ${err.message}`);
    return [null, err.message];
  }
};

const fetchAccountsByQueryWithAttributes = async (query, attributes) => {
  try {
    const accounts = await Account.findAll({
      where: query,
      attributes,
      include: [
        { model: User, attributes: ['user_id', 'salesforce_owner_id'] },
      ],
    });

    return [accounts, null];
  } catch (err) {
    logger.error(`Error while fetching accounts by query: ${err.message}`);
    return [null, err.message];
  }
};

const updateAccountByQuery = async (query, account) => {
  try {
    const updatedAccount = await Account.update(account, {
      where: query,
    });
    return [updatedAccount, null];
  } catch (err) {
    logger.error(`Error while updating account by query: ${err.message}`);
    return [null, err];
  }
};

const fetchAccountsByLeadToCadenceQuery = async (query) => {
  try {
    const accounts = await Account.findAll({
      // where: query,
      include: [
        {
          model: Lead,
          required: true,
          where: {
            [Op.not]: {
              salesforce_contact_id: null,
            },
          },
          include: [
            {
              model: LeadToCadence,
              where: {
                cadence_id: query.cadence_id,
              },
              attributes: { exclude: ['created_at , updated_at'] },
              required: true,
            },
            {
              model: User,
              attributes: [
                'user_id',
                'first_name',
                'last_name',
                'salesforce_owner_id',
              ],
            },
          ],
          attributes: [
            'lead_id',
            'first_name',
            'last_name',
            'salesforce_contact_id',
            'salesforce_lead_id',
          ],
        },
        {
          model: User,
          attributes: ['first_name', 'last_name'],
        },
      ],
      attributes: { exclude: ['created_at , updated_at'] },
    });
    return [accounts, null];
  } catch (err) {
    logger.error(`Error while fetching accounts by query: ${err.message}`);
    return [null, err.message];
  }
};

const fetchAccountLeads = async (query) => {
  try {
    const accounts = await Account.findAll({
      where: query,
      include: [
        {
          model: Lead,
          where: {
            [Op.not]: {
              salesforce_contact_id: null,
            },
          },
        },
      ],
      attributes: { exclude: ['created_at , updated_at'] },
    });
    return [accounts, null];
  } catch (err) {
    logger.error(`Error while fetching accounts by query: ${err.message}`);
    return [null, err.message];
  }
};

const fetchAccountLeadsWithSalesforceContactId = async (query, cadence_id) => {
  try {
    const accounts = await Account.findAll({
      where: query,
      include: [
        {
          model: Lead,
          where: {
            [Op.not]: {
              salesforce_contact_id: null,
            },
          },
          required: true,
          include: [
            {
              model: LeadToCadence,
              where: {
                cadence_id,
              },
              attributes: { exclude: ['created_at , updated_at'] },
              required: true,
            },
          ],
        },
      ],
      attributes: { exclude: ['created_at , updated_at'] },
    });
    return [accounts, null];
  } catch (err) {
    logger.error(`Error while fetching accounts by query: ${err.message}`);
    return [null, err.message];
  }
};

const deleteAccountsByQuery = async (query) => {
  try {
    const data = await Account.destroy({
      where: query,
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while deleting account by query: ${err.message}`);
    return [null, err.message];
  }
};

const AccountRepository = {
  findOrCreateAccount,
  getAllAccounts,
  fetchAccountByQuery,
  fetchAccountsByQuery,
  fetchAccountsByQueryWithAttributes,
  updateAccountByQuery,
  fetchAccountsByLeadToCadenceQuery,
  fetchAccountLeads,
  fetchAccountLeadsWithSalesforceContactId,
  deleteAccountsByQuery,
};

module.exports = AccountRepository;
