// Utils
const logger = require('../../utils/winston');
const redisClient = require('../../utils/redis');
const { REDIS_TASK_SUMMARY_EXPIRY } = require('../../utils/constants');

// Helpers and Services
const getTTL = require('./getTTL');

/**
 *
 * @param {Integer} expiryTime This should be sent in seconds.
 * @returns {Promise}
 */
const setWithExpiry = (key, value, expiryTime) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [ttl, errForTTL] = await getTTL(key);

      logger.info(`TTL FOR ${key}: ${ttl}.`);

      // if ttl exists, set the key and retain its TTL
      if (ttl > 0) {
        logger.info(`PREVIOUS TTL NOT EXPIRED, SO RETAINING IT.`);
        redisClient.set(key, value, 'KEEPTTL');
      } else {
        logger.info(`CREATING TTL`);
        redisClient.set(
          key,
          value,
          'EX',
          Math.round(expiryTime) ?? REDIS_TASK_SUMMARY_EXPIRY
        );
      }

      return resolve([true, null]);
    } catch (err) {
      console.log(err);
      logger.error(`Error while setting values in redis: `, err);
      return reject([null, err.message]);
    }
  });
};

module.exports = setWithExpiry;
