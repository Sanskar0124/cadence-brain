const fetchSnovToken = require('./lib/fetchSnovToken');
const fetchValidEmailsFromLinkedinUrl = require('./lib/fetchValidEmailsFromLinkedinUrl');

const SnovService = {
  fetchSnovToken,
  fetchValidEmailsFromLinkedinUrl,
};

module.exports = SnovService;
