const logger = require('../../../utils/winston');
const axios = require('axios');

const describeObject = async (sObject, access_token, instance_url) => {
  try {
    // * Make first letter capital to conform with salesforce schema
    sObject = sObject[0].toUpperCase() + sObject.substring(1);

    // Disqualify Contact in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/${sObject}/describe`;
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return [response?.data?.fields, null];
  } catch (err) {
    logger.error(`An error while describing sObject: `, err);
    return [null, err.message];
  }
};

module.exports = {
  describeObject,
};
