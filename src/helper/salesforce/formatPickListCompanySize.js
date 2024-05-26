// Utils
const logger = require('../../utils/winston');
const { ACCOUNT_SIZE } = require('../../utils/enums');

const formatPickListCompanySize = (size) => {
  try {
    // Check if the size is already in the given range format.
    if (ACCOUNT_SIZE.includes(size)) {
      return size;
    }

    // Split the size string into two parts.
    if (!size) return '';
    const [lower, upper] = size.split('-');

    if (!lower) {
      size = parseInt(size); // to handle negative numbers
    } else if (!upper) {
      size = parseInt(lower); // to handle positive numbers
    } else {
      size = parseInt(upper); // to handle range
    }

    if (size <= 0) return ACCOUNT_SIZE[0];
    if (size >= parseInt(ACCOUNT_SIZE[ACCOUNT_SIZE?.length - 1]))
      return ACCOUNT_SIZE[ACCOUNT_SIZE?.length - 1];

    // Iterate over the ranges and find the closest upper range.
    for (let i = 1; i < ACCOUNT_SIZE.length - 1; i++) {
      const currentUpper = ACCOUNT_SIZE[i].split('-')[1];
      if (size <= parseInt(currentUpper)) return ACCOUNT_SIZE[i];
    }

    // If no range is found, return the original size.
    return size;
  } catch (err) {
    logger.error('An error occurred while formatting size for company ', err);
    return '';
  }
};

module.exports = formatPickListCompanySize;
