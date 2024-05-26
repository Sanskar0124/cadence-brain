const getCompanyPhone = require('./lib/getCompanyPhone');
const fetchValidEmails = require('./lib/fetchValidEmails');

const DropContactService = {
  getCompanyPhone,
  fetchValidEmails,
};

module.exports = DropContactService;
