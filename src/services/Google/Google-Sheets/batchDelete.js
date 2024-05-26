// Utils
const logger = require('../../../utils/winston');
const creds = require('../../../../../service-account.json');

// Packages
const { google } = require('googleapis');

const batchDelete = async ({ spreadsheetId, data }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: creds.client_email,
          private_key: creds.private_key,
        },
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });

      const client = await auth.getClient();

      const googleSheets = google.sheets({ version: 'v4', auth: client });

      //let data = [
      //{
      //deleteDimension: {
      ////range: `Sheet1!A1`,
      //range: {
      //sheetId: 0,
      //dimension: 'ROWS',
      //startIndex: 1,
      //endIndex: 2,
      //},
      //},
      //},
      //];
      googleSheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests: data },
      });
      return resolve(['Batch delete successfull.', null]);
    } catch (err) {
      logger.error(`Error while deleting in batch in google sheets: `, err);
      return reject([null, err.message]);
    }
  });
};
//console.log('hi');
//batchDelete({ spreadsheetId: '1mdtxkAzvO1MsX4QqpwTmZabmzpvRH958yOYzI-u-9Ek' });

module.exports = batchDelete;
