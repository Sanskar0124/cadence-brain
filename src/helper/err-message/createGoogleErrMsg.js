// Utils
const logger = require('../../utils/winston');

// Packages
const csv = require('fast-csv');

const createGoogleErrMsg = async (route, method) => {
  try {
    let errMsg = '';
    if (route === '/v2/events') {
      switch (method) {
        case 'GET':
          errMsg = 'Please connect with google to view events';
          break;

        case 'POST':
          errMsg = 'Please connect with google to fetch events';
          break;

        default:
          break;
      }
    } else if (route.includes('event')) {
      switch (method) {
        case 'GET':
          errMsg = 'Please connect with google to fetch single event';
          break;

        case 'POST':
          errMsg = 'Please connect with google to create events';
          break;

        case 'PUT':
          errMsg = 'Please connect with google to update events';
          break;

        case 'DELETE':
          errMsg = 'Please connect with google to delete events';
          break;

        default:
          break;
      }
    } else {
      errMsg = 'Please connect with google';
    }
    return [errMsg, null];
  } catch (err) {
    logger.error(`Error while creating error message for calendar: `, err);
    return [null, err.message];
  }
};

module.exports = createGoogleErrMsg;
