// Utils
const logger = require('../../utils/winston');
const {
  REDIS_ADDED_USER_IDS_FOR_MAIL,
  REDIS_ADDED_USER_IDS_FOR_MESSAGE,
} = require('../../utils/constants');

// Repositories
const UserRepository = require('../../repository/user-repository');

// Helpers And Services
const JsonHelper = require('../json');
const getValue = require('./get');
const setValue = require('./create');

const removeCompanyUsers = (company_id, key) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        ![
          REDIS_ADDED_USER_IDS_FOR_MAIL,
          REDIS_ADDED_USER_IDS_FOR_MESSAGE,
        ].includes(key)
      ) {
        logger.error(`Invalid key: ${key} received.`);
        return [null, `Invalid key: ${key} received.`];
      }

      let [users, errForUsers] = await UserRepository.findUsersByQuery({
        company_id,
      });

      if (errForUsers) return reject([null, errForUsers]);

      users = JsonHelper.parse(users);

      let userIds = users?.map((user) => user?.user_id) || [];

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

      return resolve([`Removed company users from redis.`, null]);
    } catch (err) {
      logger.error(`Error while removing company users from redis: `, err);
      return reject([null, err.message]);
    }
  });
};

//removeCompanyUsers(
//'4192bff0-e1e0-43ce-a4db-912808c32493',
//'added-user-ids-for-mail'
//);

module.exports = removeCompanyUsers;
