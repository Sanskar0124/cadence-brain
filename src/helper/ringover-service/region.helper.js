// * Util Imports
const { COMPANY_REGION } = require('../../utils/enums');

module.exports = (region) => {
  return region === COMPANY_REGION.EU
    ? 'https://api-eu.ringover.com'
    : 'https://api-us.ringover.com';
};
