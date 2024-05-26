//Utils
const logger = require('winston');
const { SLACK_CHATBOT_CHANNEL } = require('../../utils/config');

//Helpers and services
const SlackHelper = require('../slack');

const sendInitMessage = async ({
  first_name = '',
  last_name = '',
  email = '',
  issue_id = '',
  company = '',
  channel = SLACK_CHATBOT_CHANNEL,
  timeZone = '',
  role = '',
  user_id = '',
  subDepartment = '',
  lang = '',
  integration_type = '',
  mail_integration_type = '',
}) => {
  try {
    let message = await SlackHelper.getInitMessageJSON({
      first_name,
      last_name,
      email,
      issue_id,
      company,
      timeZone,
      user_id,
      role,
      subDepartment,
      lang,
      integration_type,
      mail_integration_type,
    });
    let [res, err] = await SlackHelper.sendSlackMessage({
      text: message,
      channel,
    });
    if (err) return [null, err];
    let thread_id = res.data.ts;
    return [thread_id, null];
  } catch (err) {
    logger.error('Error while sending chatbot init message: ', err);
    return [null, err.message];
  }
};

module.exports = sendInitMessage;
