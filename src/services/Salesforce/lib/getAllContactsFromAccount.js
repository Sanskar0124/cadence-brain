const SalesforceQuery = require('./query');
const logger = require('../../../utils/winston');
const getAllContactsFromAccount = (accounts, instance_url, access_token) => {
  try {
    if (!Array.isArray(accounts) || accounts?.length === 0)
      return [null, 'Please provide atleast one account'];

    const serializedAccounts = accounts.map((acc) => `'${acc}'`).join(',');
    const query = `select id from Contact where Account.id in (${serializedAccounts})`;
    return SalesforceQuery.query(query, access_token, instance_url);
  } catch (err) {
    logger.error(
      'An error occurred while getting contacts using accounts:',
      err
    );
    return [null, err?.message ?? 'Cannot be reassigned'];
  }
};

module.exports = { getAllContactsFromAccount };
