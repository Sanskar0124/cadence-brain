// Utils
const logger = require('../../utils/winston');

// Packages
const csv = require('fast-csv');

const parseCsvColumn = (file, delimiter = ';') => {
  return new Promise((resolve, reject) => {
    try {
      let columnNames = [];
      let options = { headers: true };
      if (delimiter) options.delimiter = delimiter;
      csv
        .parseFile(file, options)
        .on('data', (data) => {
          columnNames = Object.keys(data);
        })
        .on('end', async () => {
          return resolve([columnNames, null]);
        })
        .on('error', async (error) => {
          logger.error('Unable to process CSV: ', error);
          if (error.message.includes('Duplicate headers found')) {
            error.message = error.message.replace(
              /Duplicate headers found \[(.+)\]/,
              'Duplicate columns present: $1'
            );
            return resolve([null, error.message]);
          }
          return resolve([null, error.message]);
        });
    } catch (err) {
      logger.error(`Error while getting values from redis: `, err);
      resolve([null, err.message]);
    }
  });
};

module.exports = parseCsvColumn;
