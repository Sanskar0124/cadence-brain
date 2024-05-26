// Utils
const logger = require('../../utils/winston');

// Services
const SalesforceService = require('../../services/Salesforce');

const getNameFieldForSobject = async (sObject, access_token, instance_url) => {
  try {
    // * Describe sObject
    const [describedObject, errDescribedObject] =
      await SalesforceService.describeObject(
        sObject,
        access_token,
        instance_url
      );
    if (errDescribedObject) return [null, errDescribedObject];

    let nameField = describedObject.filter(
      (fields) => fields.nameField === true
    );

    return [
      {
        label: nameField[0].label,
        name: nameField[0].name,
        sObject,
      },
      null,
    ];
  } catch (err) {
    logger.error(
      'An error occurred while fetching name field for sObject: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = {
  getNameFieldForSobject,
};
