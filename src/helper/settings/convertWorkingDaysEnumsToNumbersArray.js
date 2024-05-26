// Utils
const logger = require('../../utils/winston');
const { DAYS_OF_WEEK } = require('../../utils/enums');

// ['saturday'] -> [0, 0, 0, 0, 0, 1, 0]
const convertWorkingDaysEnumsToNumbersArray = (arrayOfEnums) => {
  try {
    if (!arrayOfEnums?.length) return [null, 'Array cannot be empty.'];
    if (arrayOfEnums.length > 7)
      return [null, 'Array cannot contain more than 7 elements'];

    // initialize an array with 7 elements
    // and fill 0 in each one
    const numbersArray = new Array(7).fill(0);
    const daysArray = Object.values(DAYS_OF_WEEK);
    arrayOfEnums.forEach((day) => {
      const index = daysArray.indexOf(day);
      numbersArray[index] = 1;
    });

    return [numbersArray, null];
  } catch (err) {
    logger.error(
      'Error while converting working days enums to numbers array: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = convertWorkingDaysEnumsToNumbersArray;
