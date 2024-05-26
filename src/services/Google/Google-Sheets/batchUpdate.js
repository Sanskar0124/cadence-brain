// Utils
const logger = require('../../../utils/winston');
const creds = require('../../../../../service-account.json');

// Packages
const { google } = require('googleapis');

const batchUpdate = async ({ spreadsheetId, data }) => {
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

      //console.log(googleSheets.spreadsheets.values);
      //let data = [
      //{
      //values: [
      //[
      //'John',
      //'Doe',
      //'John Doe',
      //'https://www.linkedin.com/in/johndoe',
      //'Sales Manager',
      //'Ringover',
      //'51-200',
      //'ww.ringover.com',
      //'France',
      //91810474496691,
      //'92100',
      //'3387826798',
      //'123',
      //'',
      //'',
      //'john.doe@ringover.com',
      //'',
      //'',
      //'',
      //'',
      //'',
      //'GS167292098631',
      //],
      //],
      //range: `Sheet1!A2:V2`,
      //},
      //{
      //values: [
      //[
      //'John yes',
      //'Doe yes',
      //'John yes Doe yes',
      //'https://www.linkedin.com/in/johndoe/yes',
      //'Sales Manager yes',
      //'Ringover yes',
      //'51-200 yes',
      //'ww.ringover.com yes',
      //'France yes',
      //918104,
      //'92100 yes',
      //'3387826798 yes',
      //'123 yes',
      //'',
      //'',
      //'john.doe@ringover.com',
      //'',
      //'',
      //'',
      //'',
      //'',
      //'GS167292098631',
      //],
      //],
      //range: `Sheet1!A2`,
      //},
      //];
      //console.log(data);
      //let data = [
      //{
      //values: [new Array(21).fill('')],
      //range: 'Sheet1!A81',
      //},
      //];
      //console.log(data);
      googleSheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: { valueInputOption: 'USER_ENTERED', data },
      });
      return resolve(['Batch update successfull.', null]);
    } catch (err) {
      logger.error(`Error while updating in batch in google sheets: `, err);
      return reject([null, err.message]);
    }
  });
};
//console.log('hi');
//batchUpdate({ spreadsheetId: '1mdtxkAzvO1MsX4QqpwTmZabmzpvRH958yOYzI-u-9Ek' });

module.exports = batchUpdate;
