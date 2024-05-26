// Utils
const logger = require('../../utils/winston');

// Helpers and Services
const setValue = require('./create');
const getValue = require('./get');

const addValueToArray = (key, element) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('removing');
      let [array, errForArray] = await getValue(key);

      array = JSON.parse(array);

      if (array?.length) {
        array = [...new Set(array.concat([element]))];

        let [newArray, errForNewArray] = await setValue(
          key,
          JSON.stringify(array)
        );

        if (errForNewArray) return reject([null, errForNewArray]);

        logger.info(`Value added to array in redis.`);

        return resolve(['Value added to array in redis.', null]);
      }

      let [newArray, errForNewArray] = await setValue(
        key,
        JSON.stringify([element])
      );
      logger.info(`Empty Array created for key and value added to array.`);
      return resolve([
        `Empty Array created for key and value added to array.`,
        null,
      ]);
    } catch (err) {
      // console.log(err);
      logger.error(`Error while adding value to an array in redis: `, err);
      reject([null, err.mesage]);
    }
  });
};

// addValueToArray('test', 3);

module.exports = addValueToArray;
