// Utils
const logger = require('../../utils/winston');

// Packages
const xlsx = require('xlsx');

const parseXlsx = (file, limit = 501) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(file, { sheetRows: limit });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const options = {
        blankrows: false,
        defval: '',
        raw: false,
        rawNumbers: false,
      };

      let workbook_response = xlsx.utils.sheet_to_json(worksheet, options);

      resolve([workbook_response, null]);
    } catch (err) {
      logger.error(`Error while getting values from redis: `, err);
      reject([null, err.message]);
    }
  });
};

module.exports = parseXlsx;
