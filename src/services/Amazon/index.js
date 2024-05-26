const sendMails = require('./lib/sendMails');
const sendHtmlMails = require('./lib/sendHtmlMails');

const AmazonService = {
  sendMails,
  sendHtmlMails,
};

module.exports = AmazonService;
