// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

const client = require('./setup');

const Repository = require('../../repository');

const sendDeleteTask = async ({ user_id, email, task_id }) => {
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

    let data = await client.sendDeleteTask({
      email,
      task_id,
    });

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error(
      'Error while sending delete task to socket service via grpc: ',
      err
    );
    console.log('Stack trace sendDeleteTask.js: ', err);
    return [null, err.message];
  }
};

module.exports = sendDeleteTask;
