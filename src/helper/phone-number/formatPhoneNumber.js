// Utils
const logger = require('../../utils/winston');

const formatPhoneNumber = (phoneNumber) => {
  let newPhoneNumber = '';
  if (typeof phoneNumber === 'string')
    newPhoneNumber = phoneNumber?.replace(/[^0-9]/g, '');

  return [newPhoneNumber, null];
};

module.exports = formatPhoneNumber;
