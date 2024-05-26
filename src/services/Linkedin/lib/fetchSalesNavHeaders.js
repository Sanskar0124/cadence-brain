// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');
let setCookie = require('set-cookie-parser');

const fetchSalesNavHeaders = async (cookie, cookie2) => {
  try {
    logger.info(`Generating headers for sales navigator...`);

    let res = await axios.get('https://www.linkedin.com/sales/home');
    const sid = setCookie.parse(res, {
      decodeValues: true, // default: true
      map: true, //default: false
    })['JSESSIONID'].value;
    const cookies = setCookie.parse(res, {
      decodeValues: true, // default: true
      map: true, //default: false
    });

    let cookie_string = `li_at=${cookie};li_a=${cookie2};`;
    for (const key in cookies) cookie_string += `${key}=${cookies[key].value};`;

    let headers = {
      Cookie: cookie_string,
      'x-restli-protocol-version': '2.0.0',
      'csrf-token': sid,
    };

    logger.info(`Generated headers for sales navigator`);

    return [headers, null];
  } catch (err) {
    logger.error(`Error while fetching sales navigator headers: `, err);
    return [null, err.message];
  }
};

module.exports = fetchSalesNavHeaders;
