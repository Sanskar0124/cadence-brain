// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');

const associateContactWithAccount = async ({
  access_token,
  instance_url,
  contact_id,
  account_id,
}) => {
  try {
    let URL = `${instance_url}/api/data/v9.2/contacts(${contact_id})`;

    const res = await axios.patch(
      URL,
      {
        'parentcustomerid_account@odata.bind': `accounts(${account_id})`,
      },
      {
        headers: {
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'If-Match': '*',
          'If-None-Match': null,
          Accept: 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (res.status !== 204)
      return [null, 'Error while associating contact with account in dynamics'];
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while creating Account in dynamics: ${
        err.response.data.error.message || err.message
      }`
    );
    return [null, err.message];
  }
};

module.exports = associateContactWithAccount;
