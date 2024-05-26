const {
  syncSalesforceData,
  syncSalesforceEmail,
  syncSalesforcePhoneNumber,
  syncSalesforceAll,
} = require('./syncSalesforceData');
const bullhornController = require('./syncBullhornData');
module.exports = {
  syncSalesforceData,
  syncSalesforceEmail,
  syncSalesforcePhoneNumber,
  syncSalesforceAll,
  bullhornController,
};
