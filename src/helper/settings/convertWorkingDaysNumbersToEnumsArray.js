// Utils
const logger = require('../../utils/winston');
const { DAYS_OF_WEEK } = require('../../utils/enums');

// [0, 0, 0, 0, 0, 1, 0] -> ['saturday']
const convertWorkingDaysNumbersToEnumsArray = (arrayOfNumbers) => {
  try {
    if (!arrayOfNumbers?.length || arrayOfNumbers.length !== 7)
      return [null, 'Array should contain 7 elements.'];

    const enumsArray = [];
    arrayOfNumbers.forEach((number, index) => {
      if (number === 1) enumsArray.push(DAYS_OF_WEEK[index + 1]);
    });

    return [enumsArray, null];
  } catch (err) {
    logger.error(
      'Error while converting working days numbers to enums array: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = convertWorkingDaysNumbersToEnumsArray;
