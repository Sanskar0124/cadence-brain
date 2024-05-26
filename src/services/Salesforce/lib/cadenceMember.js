const axios = require('axios');
const logger = require('../../../utils/winston');

const getCadenceMemberByCadenceIdAndLeadId = async (
  salesforce_cadence_id,
  salesforce_lead_id,
  access_token,
  instance_url
) => {
  try {
    const query = `SELECT+id,+RingoverCadence__Status__c,+RingoverCadence__Cadence__c,+RingoverCadence__Contact__c,+RingoverCadence__Lead__c+FROM+RingoverCadence__Cadence_Member__c+WHERE+RingoverCadence__Cadence__c+=%27${salesforce_cadence_id}%27+AND+RingoverCadence__Lead__c+=%27${salesforce_lead_id}%27`;
    const URL = `${instance_url}/services/data/v52.0/query?q=${query}`;
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.totalSize === 0) return [[], null];
    return [response.data.records, null];
  } catch (err) {
    logger.error(
      `Error while fetching cadence member from salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

const getCadenceMemberByCadenceIdAndContactId = async (
  salesforce_cadence_id,
  salesforce_contact_id,
  access_token,
  instance_url
) => {
  try {
    const query = `SELECT+id,+RingoverCadence__Status__c,+RingoverCadence__Cadence__c,+RingoverCadence__Contact__c,+RingoverCadence__Lead__c+FROM+RingoverCadence__Cadence_Member__c+WHERE+RingoverCadence__Cadence__c+=%27${salesforce_cadence_id}%27+AND+RingoverCadence__Contact__c+=%27${salesforce_contact_id}%27`;
    const URL = `${instance_url}/services/data/v52.0/query?q=${query}`;
    console.log(URL);
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.totalSize === 0) return [[], null];
    return [response.data.records, null];
  } catch (err) {
    logger.error(
      `Error while fetching cadence member from salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

const updateCadenceMember = async (
  salesforce_cadence_member_id,
  cadence_member,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/RingoverCadence__Cadence_Member__c/${salesforce_cadence_member_id}`;
    const response = await axios.patch(URL, cadence_member, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while updating cadence member from salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

// * Create contact cadenceMember record
const createContactCadenceMember = async (
  salesforce_cadence_id,
  salesforce_contact_id,
  cadence_status,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/RingoverCadence__Cadence_Member__c`;
    const response = await axios.post(
      URL,
      {
        RingoverCadence__Cadence__c: salesforce_cadence_id,
        RingoverCadence__Contact__c: salesforce_contact_id,
        RingoverCadence__Status__c: cadence_status,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while creating contact cadence member in salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

// * Create lead cadenceMember record
const createLeadCadenceMember = async (
  salesforce_cadence_id,
  salesforce_lead_id,
  cadence_status,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/RingoverCadence__Cadence_Member__c`;
    const response = await axios.post(
      URL,
      {
        RingoverCadence__Cadence__c: salesforce_cadence_id,
        RingoverCadence__Lead__c: salesforce_lead_id,
        RingoverCadence__Status__c: cadence_status,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while creating lead cadence member in salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

const deleteLeadCadenceMember = async (
  lead_cadence_member_id,
  access_token,
  instance_url
) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/sobjects/RingoverCadence__Cadence_Member__c/${lead_cadence_member_id}`;
    const response = await axios.delete(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return [true, null];
  } catch (err) {
    logger.error(
      `Error while deleting lead cadence member in salesforce: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  getCadenceMemberByCadenceIdAndLeadId,
  getCadenceMemberByCadenceIdAndContactId,
  updateCadenceMember,
  createContactCadenceMember,
  createLeadCadenceMember,
  deleteLeadCadenceMember,
};
