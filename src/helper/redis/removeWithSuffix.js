// Utils
const logger = require('../../utils/winston');
const redisClient = require('../../utils/redis');

const removeWithSuffix = (keySuffix) => {
  return new Promise((resolve, reject) => {
    try {
      let cursor = '0';
      const pattern = '*' + keySuffix;
      const scan = (cursor) => {
        redisClient.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          '10',
          (err, reply) => {
            if (err) {
              logger.error('Redis error:', err);
              reject([null, err]);
            }
            cursor = reply[0];
            const keys = reply[1];
            keys.forEach((key) => {
              redisClient.del(key);
            });
            if (cursor != '0') scan(cursor);
            else resolve([true, null]);
          }
        );
      };
      scan(cursor);
    } catch (err) {
      logger.error(`Error while getting values from redis for suffix: `, err);
      reject([null, err.mesage]);
    }
  });
};

module.exports = removeWithSuffix;
