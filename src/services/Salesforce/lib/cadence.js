const logger = require('../../../utils/winston');
const axios = require('axios');
const { FRONTEND_URL } = require('../../../utils/config');

const createCadence = async (cadence, access_token, instance_url) => {
  try {
    let body = {
      Name: cadence.name,
      RingoverCadence__Cadence_Id__c: cadence.cadence_id,
      RingoverCadence__Status__c: cadence.status,
      RingoverCadence__Cadence_Link__c: `${FRONTEND_URL}/sales/manager/cadence/${cadence.cadence_id}`,
    };

    // Creating Content Note in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/RingoverCadence__Cadence__c`;
    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.data.success) {
      logger.error('Something went wrong while creating cadence');
      console.log(response.data.errors);
      return [null, response.data.errors];
    }

    console.log(response.data);
    return [response.data.id, null];
  } catch (err) {
    logger.error(
      `Error while creating cadence in salesforce cadence service: ${err.message}`
    );
    if (err.response) console.log(err.response.data);
    return [null, err.message];
  }
};

const updateCadence = async (cadence, access_token, instance_url) => {
  try {
    let body = {
      Name: cadence.name,
      RingoverCadence__Cadence_Id__c: cadence.cadence_id,
      RingoverCadence__Status__c: cadence.status,
    };

    // Updating Cadence in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/RingoverCadence__Cadence__c/${cadence.salesforce_cadence_id}`;
    const response = await axios.patch(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status === 404) {
      logger.error(
        `Something went wrong while updating cadence in salesforce: ${err.message}`
      );
      return [null, response.data];
    }

    return [true, null];
  } catch (err) {
    logger.error(
      `Something went wrong while updating cadence in salesforce: ${err.message}`
    );
    if (err.response) console.log(err.response.data);
    return [null, err.message];
  }
};

const deleteCadence = async (cadence, access_token, instance_url) => {
  try {
    // Deleting Cadence in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/RingoverCadence__Cadence__c/${cadence.salesforce_cadence_id}`;
    const response = await axios.delete(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.status === 204) {
      logger.info('Cadence deleted from salesforce succesfully');
      return [true, null];
    }
    logger.error('Cadence does not exist');
    return [null, response.data.message];
  } catch (err) {
    logger.error(
      `Error while deleting cadence from salesforce: ${err.message}`
    );
    if (err.response) console.log(err.response.data);
    return [null, err.message];
  }
};

// * Get cadence
const getCadence = async (cadence_id, access_token, instance_url) => {
  try {
    const URL = `${instance_url}/services/data/v52.0/query?q=SELECT+id+FROM+RingoverCadence__Cadence__c+Where+RingoverCadence__Cadence_Id__c='${cadence_id}'`;
    const { data } = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while fetching salesforce cadence Id from salesforce: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  createCadence,
  updateCadence,
  deleteCadence,
  getCadence,
};
