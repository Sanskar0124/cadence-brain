//Utils
const logger = require('winston');
const { SLACK_CHATBOT_TOKEN } = require('../../utils/config');

//Packages
const axios = require('axios');
const FormData = require('form-data');

const sendSlackFile = async ({
  channel = '',
  file,
  thread_id = '',
  text = '',
}) => {
  try {
    let message = new FormData();
    message.append('file', Buffer.from(file.buffer), file.originalname);
    message.append('channels', channel);
    message.append('thread_ts', thread_id);
    message.append('initial_comment', text);
    const url = 'https://slack.com/api/files.upload';
    const response = await axios.post(url, message, {
      headers: {
        ...message.getHeaders(),
        authorization: `Bearer ${SLACK_CHATBOT_TOKEN}`,
      },
    });

    // const id = {
    //     file:response.data.file.id
    // }
    // const url1 = 'https://slack.com/api/files.sharedPublicURL';
    // let response1 = await axios.post(url1, JSON.stringify(id), {
    //   headers: {
    //     authorization: `Bearer ${SLACK_USER_TOKEN}`,
    //     'content-type': 'application/json',
    //   },
    // });
    // let image_url = response1.data.file.url_private+"?pub_secret="+response1.data.file.permalink_public.split(id.file+"-")[1]
    // //console.log(image_url)
    // const url2 = 'https://slack.com/api/chat.postMessage';
    // const message2 = await SlackHelper.getImageMessageJSON({
    //   first_name,
    //   last_name,
    //   email,
    //   image_url,
    //   company,
    //   timeZone,
    //   role,
    //   subDepartment
    // })
    // message2.channel=SLACK_CHATBOT_CHANNEL;
    // let response3 = await axios.post(url2, JSON.stringify(message2), {
    //   headers: {
    //     authorization: `Bearer ${SLACK_CHATBOT_TOKEN}`,
    //     'content-type': 'application/json',
    //   },
    // });
    return [response.data, null];
  } catch (err) {
    logger.error('Error while sending file to slack:', err);
    return [null, err.message];
  }
};

module.exports = sendSlackFile;
