// Utils
const logger = require('../../utils/winston');
const redisClient = require('../../utils/redis');

const getValue = (key) => {
  return new Promise((resolve, reject) => {
    try {
      // console.log('Key->', key);
      redisClient.get(key, (err, result) => {
        if (err) {
          logger.error('Redis error: ', err);
          reject([null, err.message]);
        }
        // console.log('Result->', result);
        return resolve([result, null]);
      });
    } catch (err) {
      logger.error(`Error while getting values from redis: `, err);
      reject[(null, err.message)];
    }
  });
};

module.exports = getValue;
