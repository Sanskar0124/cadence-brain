const logger = require('../../utils/winston');
const getGoogleSheetsUrl = (cadence) => {
  try {
    let sheetUrl = 'https://docs.google.com/spreadsheets/d/';
    if (cadence?.salesforce_cadence_id)
      sheetUrl += `/${cadence.salesforce_cadence_id}`;
    else sheetUrl = '';

    return [sheetUrl, null];
  } catch (err) {
    logger.error('An error occurred while making googleSheets URL:', err);
    return [null, err];
  }
};

module.exports = getGoogleSheetsUrl;
