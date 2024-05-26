// Utils
const logger = require('../../utils/winston');
const redisClient = require('../../utils/redis');

const getTTL = (key) => {
  return new Promise((resolve, reject) => {
    try {
      redisClient.ttl(key, (err, data) => {
        if (err) {
          logger.error(`Error while getting TTL: `, err);
          reject([null, err.message]);
        }
        logger.info(`TTL: ${data}.`);
        resolve([data, null]);
      });
    } catch (err) {
      logger.error(`Error while getting TTL: `, err);
      reject([null, err.message]);
    }
  });
};

module.exports = getTTL;
