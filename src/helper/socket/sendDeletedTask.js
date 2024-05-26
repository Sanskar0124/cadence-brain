// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

const client = require('./setup');

const Repository = require('../../repository');

const sendActivity = async ({ user_id, email, activity }) => {
  try {
    let user, errForUser;
    if (!email) {
      [user, errForUser] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: { user_id },
      });
      if (errForUser) return [null, `Error while fetching user: ${errForUser}`];
      if (!user) return [null, 'User not found.'];

      email = user.email;
    }

    let data = await client.sendActivity({
      email,
      activity,
    });

    data = JSON.parse(JSON.stringify(data));

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error(
      'Error while sending activity to socket service via grpc: ',
      err
    );
    console.log('Stack trace sendDeletedTask.js: ', err);
    return [null, err.message];
  }
};

module.exports = sendActivity;
