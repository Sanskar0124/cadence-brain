// Utils
const logger = require('../../utils/winston');

// Packages
const csv = require('fast-csv');

const parseCsv = (file, limit = 0) => {
  return new Promise((resolve, reject) => {
    try {
      let leads = [];
      let options = { headers: true };
      if (limit) options.maxRows = limit;
      csv
        .parseFile(file, options)
        .on('data', (data) => {
          leads.push(data);
        })
        .on('end', async () => {
          return resolve([leads, null]);
        });
    } catch (err) {
      logger.error(`Error while getting values from redis: `, err);
      reject[(null, err.message)];
    }
  });
};

module.exports = parseCsv;
