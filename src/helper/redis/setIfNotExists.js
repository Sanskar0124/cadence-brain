// Utils
const logger = require('../../utils/winston');
const redisClient = require('../../utils/redis');
const { REDIS_TASK_SUMMARY_EXPIRY } = require('../../utils/constants');

/**
 * @description this functions set the value for a key if the key doest not already exists
 * @param {String} key - key which needs to be set
 * @param {String} value - value that needs to be set
 * @returns {Promise}
 */
const setWithExpiry = (key, value) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`SETTING IF DOES NOT EXIST`);
      redisClient.set(key, value, 'NX', (err, reply) => {
        console.log({
          key,
          value,
          err,
          reply,
        });
        //console.log('In setnx callback: ');
        //console.log('err: ', err);
        //console.log('data: ', reply);
        if (!reply)
          return resolve([
            null,
            `Error occured while setting with nx: ${err?.message}`,
          ]);
        return resolve([true, null]);
      });
    } catch (err) {
      logger.error(
        `Error while setting values if does not exists in redis: `,
        err
      );
      return reject([null, err.mesage]);
    }
  });
};

//(async function test() {
//try {
//const [data, err] = await setWithExpiry('task', 1);
//console.log(data, err);
//} catch (err) {
//console.log('in test: ', err);
//}
//})();

module.exports = setWithExpiry;
