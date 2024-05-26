// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

const client = require('./setup');

const Repository = require('../../repository');

const sendNotification = async ({
  email,
  type,
  lead_id,
  lead_first_name,
  lead_last_name,
  title,
  message_id,
  withTime,
  user_id,
}) => {
  try {
    let user, errForUser;
    if (!email && user_id) {
      [user, errForUser] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: { user_id },
      });
      if (errForUser) return [null, `Error while fetching user: ${errForUser}`];
      if (!user) return [null, 'User not found.'];

      email = user.email;
    }

    let lead, errForLead;
    if (!lead_first_name || !lead_first_name) {
      [lead, errForLead] = await Repository.fetchOne({
        tableName: DB_TABLES.LEAD,
        query: { lead_id },
      });
      if (errForLead) return [null, `Error while fetching lead: ${errForLead}`];
      if (!lead) return [null, 'Lead not found.'];

      lead_first_name = lead.first_name;
      lead_last_name = lead.last_name;
    }

    let data = await client.sendNotification({
      email,
      type,
      lead_id,
      lead_first_name,
      lead_last_name,
      title,
      message_id,
      withTime,
    });

    if (data.success) return [data.msg, null];
    else return [null, data.msg];
  } catch (err) {
    logger.error(
      'Error while sending notification to socket service via grpc: ',
      err
    );
    console.log('Stack trace sendNotification.js: ', err);
    return [null, err.message];
  }
};

module.exports = sendNotification;
