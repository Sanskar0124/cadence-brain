// Utils
const logger = require('../../utils/winston');
const redisClient = require('../../utils/redis');

const setValue = (key, value) => {
  return new Promise((resolve, reject) => {
    try {
      redisClient.set(key, value);
      return resolve([true, null]);
    } catch (err) {
      logger.error(`Error while setting values in redis: `, err);
      return reject([null, err.mesage]);
    }
  });
};

//setValue('added-user-ids-for-mail', JSON.stringify(['1', '2']));

module.exports = setValue;
