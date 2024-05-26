//Utils
const creds = require('../../../../../service-account.json');
const logger = require('../../../utils/winston');
const { GOOGLE_SHEETS_LEAD_ID } = require('../../../utils/config');

//Packages
const { GoogleSpreadsheet } = require('google-spreadsheet');

const loadDocument = async (id = GOOGLE_SHEETS_LEAD_ID) => {
  try {
    // const regex =
    //   /https:\/\/docs.google.com\/spreadsheets\/d\/(.+)\/edit#gid=(.+)/;
    // const [_, spreadsheetId, sheetId] = id.match(regex);
    const doc = new GoogleSpreadsheet(id);
    await doc.useServiceAccountAuth({
      client_email: creds.client_email,
      private_key: creds.private_key,
    });
    await doc.loadInfo();
    //console.log(doc.sheetsByIndex(0));
    return [doc, null];
  } catch (err) {
    logger.error('Error while loading document:', err);
    return [null, err.message];
  }
};

//loadDocument('1RnsFz1JLyK4zzFm_EXVuNEYx11dZR-m0HHYxQbu5qAs');

module.exports = loadDocument;
