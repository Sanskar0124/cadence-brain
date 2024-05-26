// Utils
const logger = require('../../utils/winston');

// Helpers and Services
const setValue = require('./create');
const getValue = require('./get');

const removeValueFromArray = (key, element) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('removing');
      let [array, errForArray] = await getValue(key);

      if (array?.length) {
        array = JSON.parse(array);

        array = array?.filter((el) => parseInt(el) !== parseInt(element));

        let [newArray, errForNewArray] = await setValue(
          key,
          JSON.stringify(array)
        );

        if (errForNewArray) return reject([null, errForNewArray]);

        logger.info(`Value removed from array in redis.`);

        return resolve(['Value removed from array in redis.', null]);
      }
      logger.info(`Value for key was null or can be empty.`);
      return resolve(['Value for key was null or can be empty.', null]);
    } catch (err) {
      console.log(err);
      logger.error(`Error while removing values an array in redis: `, err);
      reject([null, err.mesage]);
    }
  });
};

// removeValueFromArray('test', 2);

module.exports = removeValueFromArray;
