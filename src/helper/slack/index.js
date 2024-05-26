const sendSlackMessage = require('./sendSlackMessage');
const getInitMessageJSON = require('./getInitMessageJson');
const getConversationFromSlackThread = require('./getConversationFromSlackThread');
const sendSlackFile = require('./sendSlackFile.js');
const getPublicURL = require('./getPublicURL');
const getUserDetails = require('./getUserDetails');

const SlackHelper = {
  sendSlackMessage,
  sendSlackFile,
  getInitMessageJSON,
  getConversationFromSlackThread,
  getPublicURL,
  getUserDetails,
};

module.exports = SlackHelper;
