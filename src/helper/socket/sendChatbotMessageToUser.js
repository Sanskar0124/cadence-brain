// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

const client = require('./setup');

const Repository = require('../../repository');

const sendChatbotMessageToUser = async ({
  user_id,
  email,
  ts,
  text,
  file,
  client_msg_id,
}) => {
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
      user_id = user.user_id;
    }

    let data = await client.sendChatbotMessageToUser({
      email,
      text,
      ts,
      file,
      client_msg_id,
    });

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error(
      'Error while sending chatbot message to socket service via grpc: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = sendChatbotMessageToUser;
