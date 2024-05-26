// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');
let setCookie = require('set-cookie-parser');

const fetchHeaders = async (cookie) => {
  try {
    logger.info(`Generating headers for linkedin...`);

    let res = await axios.get(
      'https://www.linkedin.com/feed/?trk=guest_homepage-basic_nav-header-signin'
    );
    const sid = setCookie.parse(res, {
      decodeValues: true, // default: true
      map: true, //default: false
    })['JSESSIONID'].value;
    const cookies = setCookie.parse(res, {
      decodeValues: true, // default: true
      map: true, //default: false
    });

    let cookie_string = `li_at=${cookie};`;
    for (const key in cookies) {
      cookie_string += `${key}=${cookies[key].value};`;
    }
    let headers = {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
      'csrf-token': sid,
      Cookie: cookie_string,
    };

    logger.info(`Generated headers for linkedin.`);

    return [headers, null];
  } catch (err) {
    logger.error(`Error while fetching linkedin headers: `, err);
    return [null, err.message];
  }
};

module.exports = fetchHeaders;
