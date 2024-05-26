// Utils
const logger = require('../../utils/winston');
const { SALESFORCE_SYNC_OPTIONS } = require('../../utils/enums');

// Helpers and services
const EmailHelper = require('../../helper/email');
const PhoneNumberHelper = require('../../helper/phone-number');

const syncSalesforceEmail = async (emailArray, salesforceData) => {
  const { lead_id } = salesforceData;
  const emailPromises = [];
  for (let i = 0; i < emailArray.length; i++) {
    if (!salesforceData[emailArray[i]]) {
      continue;
    }
    emailPromises.push(
      EmailHelper.updateEmail(
        salesforceData[emailArray[i]],
        emailArray[i],
        lead_id
      )
    );
  }
  await Promise.all(emailPromises);
};

const syncSalesforcePhoneNumber = async (phoneArray, salesforceData) => {
  const { lead_id } = salesforceData;
  const phoneNumberPromises = [];
  for (let i = 0; i < phoneArray.length; i++) {
    if (!salesforceData[phoneArray[i]]) {
      continue;
    }
    phoneNumberPromises.push(
      PhoneNumberHelper.updatePhoneNumber(
        salesforceData[phoneArray[i]],
        phoneArray[i],
        lead_id
      )
    );
  }
  await Promise.all(phoneNumberPromises);
};

const syncSalesforceAll = async ({ emails, phone_numbers }, salesforceData) => {
  await Promise.all([
    syncSalesforceEmail(emails, salesforceData),
    syncSalesforcePhoneNumber(phone_numbers, salesforceData),
  ]);
};

const syncSalesforceData = async (fieldMap, salesforceData, sync) => {
  const { emails, phone_numbers } = fieldMap;
  try {
    switch (sync) {
      case SALESFORCE_SYNC_OPTIONS.EMAIL:
        await syncSalesforceEmail(emails, salesforceData);
        break;
      case SALESFORCE_SYNC_OPTIONS.PHONE_NUMBER:
        await syncSalesforcePhoneNumber(phone_numbers, salesforceData);
        break;
      case SALESFORCE_SYNC_OPTIONS.ALL:
        await syncSalesforceAll({ emails, phone_numbers }, salesforceData);
        break;
      default:
        logger.error(`Invalid sync option: ${sync}`);
    }
  } catch (err) {
    logger.error(`Error while syncing salesforce data: `, err);
  }
};

module.exports = {
  syncSalesforceData,
  syncSalesforceEmail,
  syncSalesforcePhoneNumber,
  syncSalesforceAll,
};
