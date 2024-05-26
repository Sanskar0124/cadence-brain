// Utils
const logger = require('../../utils/winston');

// Helpers and Services
const getValue = require('./get');
const setValue = require('./create');

/**
 *
 * @param {Array} user_ids - array of user ids to be removed from redis
 * @param {String} key - redis key from which user ids needs to be removed
 * @returns
 */
const removeUsers = (userIds = [], key) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [addedUserIds, errForUserIds] = await getValue(key);

      if (errForUserIds) return reject([null, errForUserIds]);

      addedUserIds = JSON.parse(addedUserIds) || [];

      //   addedUserIds = new Set(addedUserIds);
      //   console.log(userIds);
      userIds = new Set(userIds);
      //   console.log(userIds);
      //   console.log(addedUserIds);
      addedUserIds = addedUserIds.filter((userId) => !userIds.has(userId));

      console.log(addedUserIds);

      const [added, errForAdded] = await setValue(
        key,
        JSON.stringify(addedUserIds)
      );

      if (errForAdded) return reject([null, errForAdded]);
      return resolve([`Removed users from redis.`, null]);
    } catch (err) {
      logger.error(`Error while removing users from redis: `, err);
      return reject([null, err.message]);
    }
  });
};

//removeUsers(['1'], 'added-user-ids-for-mail');

module.exports = removeUsers;
