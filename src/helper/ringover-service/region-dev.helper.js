// * Util Imports
const { COMPANY_REGION } = require('../../utils/enums');

module.exports = (region) => {
  return region === COMPANY_REGION.EU
    ? 'https://api-eu.dev137.scw.ringover.net'
    : 'https://api-us.dev137.scw.ringover.net';
};
