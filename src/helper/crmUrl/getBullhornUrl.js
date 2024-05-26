const logger = require('../../utils/winston');
const getBullhornUrl = (lead) => {
  try {
    let bullhornUrl =
      'https://cls91.bullhornstaffing.com/BullhornSTAFFING/OpenWindow.cfm?Entity=Candidate&id=';
    if (lead.integration_id) bullhornUrl += `/${lead.integration_id}`;
    else bullhornUrl = '';

    return [bullhornUrl, null];
  } catch (err) {
    logger.error('An error occurred while making bullhorn URL:', err);
    return [null, err];
  }
};

module.exports = getBullhornUrl;
