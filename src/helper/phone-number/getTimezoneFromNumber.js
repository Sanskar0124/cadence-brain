// Utils
const logger = require('../../utils/winston');

// Packages
const parsePhoneNumberFromString = require('libphonenumber-js');
const { timezones } = require('libphonenumber-geo-carrier');

// Helpers and services
const formatPhoneNumber = require('./formatPhoneNumber');

const getTimezoneFromNumber = async (number) => {
  try {
    number = number.toString();
    let err = '';
    [number, err] = formatPhoneNumber(number);

    if (err) return [null, err];

    if (!number.includes('+')) number = '+' + number;

    number = parsePhoneNumberFromString(number);

    const timeZones = await timezones(number);

    // * if timeZone is not found return timezone as null
    if (!timeZones) return [null, null];

    // * If found we will get the all timeZones in decreasing order of probability, select first one
    return [timeZones[0], null];
  } catch (err) {
    logger.error(`Error while detecting timezone from number: `, err);
    return [null, err.message];
  }
};
// getTimezoneFromNumber('08104744966');
module.exports = getTimezoneFromNumber;
