const getPipedriveUser = require('./getPipedriveUser');
const getZohoUser = require('./getZohoUser');
const getZohoOrganization = require('./getZohoOrganization');
const getBullhornUser = require('./getBullhornUser');
const getDynamicsUser = require('./getDynamicsUser');

const OauthHelper = {
  getPipedriveUser,
  getZohoUser,
  getZohoOrganization,
  getBullhornUser,
  getDynamicsUser,
};

module.exports = OauthHelper;
