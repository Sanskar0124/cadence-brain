const fetchHeaders = require('./lib/fetchHeaders');
const fetchPeopleDetails = require('./lib/fetchPeopleDetails');
const fetchCompanyDetailsFromCompanyName = require('./lib/fetchCompanyDetailsFromCompanyName');
const fetchProfilesFromSearchUrl = require('./lib/fetchProfilesFromSearchUrl');
const fetchProfileData = require('./lib/fetchProfileData');
const sendConnectionRequest = require('./lib/sendConnectionRequest');
const sendMessage = require('./lib/sendMessage');
const viewLinkedinProfile = require('./lib/viewLinkedinProfile');
const getMyProfile = require('./lib/getMyProfile');
const getNetworkInfo = require('./lib/getNetworkInfo');
const fetchClientApplicationDetails = require('./lib/fetchClientApplicationDetails');
const fetchSalesNavPeople = require('./lib/salesNavSearchPeople');
const fetchSalesNavHeaders = require('./lib/fetchSalesNavHeaders');
const searchPeople = require('./lib/searchPeople');

const LinkedinService = {
  fetchHeaders,
  fetchPeopleDetails,
  fetchCompanyDetailsFromCompanyName,
  fetchProfilesFromSearchUrl,
  fetchProfileData,
  sendConnectionRequest,
  sendMessage,
  viewLinkedinProfile,
  getMyProfile,
  getNetworkInfo,
  fetchClientApplicationDetails,
  fetchSalesNavPeople,
  fetchSalesNavHeaders,
  searchPeople,
};

module.exports = LinkedinService;
