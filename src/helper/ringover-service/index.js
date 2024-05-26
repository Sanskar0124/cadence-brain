const {
  afterCallEvent,
  hangupCallEvent,
  messageReceivedEvent,
  messageSentEvent,
  missedCallEvent,
} = require('./ringover-service.helper');

const { fetchAccessToken } = require('./oauth.helper');
const { getNumbers } = require('./numbers.helper');
const regionURL = require('./region.helper');
const regionDevURL = require('./region-dev.helper');
const getUser = require('./ringover-user.helper');

const RingoverServiceHelper = {
  afterCallEvent,
  hangupCallEvent,
  messageReceivedEvent,
  messageSentEvent,
  missedCallEvent,
  fetchAccessToken,
  getNumbers,
  regionURL,
  regionDevURL,
  getUser,
};

module.exports = RingoverServiceHelper;
