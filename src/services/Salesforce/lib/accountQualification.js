const axios = require('axios');
const logger = require('../../../utils/winston');

const getAccountQualification = async (
  salesforce_account_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Account/${salesforce_account_id}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    if (err.response.data)
      if (err.response.data[0].errorCode === 'NOT_FOUND')
        return [null, 'NOT_FOUND'];
    logger.error(
      `Error while fetching account qualification info: ${err.message}`
    );
    return [null, err.message];
  }
};

const updateAccountQualification = async (
  salesforce_account_id,
  body,
  access_token,
  instance_url
) => {
  try {
    const salesforce_contact_id = body.salesforce_contact_id;
    delete body.salesforce_contact_id;
    let URL = `${instance_url}/services/data/v52.0/sobjects/Account/${salesforce_account_id}`;
    const response = await axios.patch(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (body.CRM_1__c && salesforce_contact_id) {
      URL = `${instance_url}/services/data/v52.0/sobjects/Contact/${salesforce_contact_id}`;
      let contactBody = {
        CRM_contact__c: body.CRM_1__c,
      };
      const response1 = await axios.patch(URL, contactBody, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    }
    if (response.status === 204) return [true, null];
    else return [null, response.data[0].message];
  } catch (err) {
    logger.error(
      `Error while updating account qualification info: ${err.response.data[0].message}`
    );
    return [null, err.response.data[0].message];
  }
};

const getContactById = async (
  salesforce_contact_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/Contact/${salesforce_contact_id}`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    if (err.response.data)
      if (err.response.data[0].errorCode === 'NOT_FOUND')
        return [null, 'NOT_FOUND'];
    logger.error(
      `Error while fetching account qualification info: ${err.message}`
    );
    console.log(err.response.data);
    return [null, err.message];
  }
};

const getAllAccountLeads = async (
  salesforce_account_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/query?q=SELECT+Id,+Name+FROM+Contact+WHERE+AccountId+=%27${salesforce_account_id}%27`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [data, null];
  } catch (err) {
    if (err.response.data)
      if (err.response.data[0].errorCode === 'NOT_FOUND')
        return [null, 'NOT_FOUND'];
    logger.error(
      `Error while fetching account qualification info: ${err.message}`
    );
    return [null, err];
  }
};

module.exports = {
  getAccountQualification,
  updateAccountQualification,
  getContactById,
  getAllAccountLeads,
};
