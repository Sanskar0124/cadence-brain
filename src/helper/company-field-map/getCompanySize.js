// Utils
const logger = require('../../utils/winston');

const getCompanySize = ({ size }) => {
  try {
    if (typeof size === 'string' || typeof size === 'number')
      return [size, null];
    else if (typeof size === 'object') return [size?.name, null];

    return [null, null];
  } catch (err) {
    logger.error('An error occurred while fetching size for company ', err);
    return [null, err.message];
  }
};

module.exports = getCompanySize;
