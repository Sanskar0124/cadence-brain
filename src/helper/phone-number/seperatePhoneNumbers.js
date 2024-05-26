// Utils
const logger = require('../../utils/winston');
const { MOBILE, LANDLINE } = require('../../utils/constants');

// Packages
const PhoneNumber = require('awesome-phonenumber');

const seperatePhoneNumbers = async (phoneNumber) => {
  try {
    let result = {
      mobilePhone: '',
      phone: '',
    };

    let phoneNumbers = phoneNumber
      .trim()
      .split(',')
      .map((no) => no.trim().replace(/\s/, ''));
    let numbers = phoneNumber
      .trim()
      .split(',')
      .map((no) => no.trim());

    for (let i = 0; i < phoneNumbers.length; ) {
      const number = phoneNumbers[i];
      let flag = false;
      const pn = new PhoneNumber(number);
      //console.log(number);
      //console.log(pn.getType());
      //console.log(pn.getRegionCode());

      for (let j = 0; j < MOBILE.length; j++) {
        if (number.startsWith(MOBILE[j]) || pn.getType() === 'mobile') {
          if (!result.mobilePhone) {
            result.mobilePhone = numbers[i];
            i++;
            flag = true;
            break;
          }
        }
      }

      if (flag) continue;

      for (let j = 0; j < LANDLINE.length; j++) {
        if (number.startsWith(LANDLINE[j]) || pn.getType() === 'fixed-line') {
          if (!result.phone) {
            result.phone = numbers[i];
            i++;
            flag = true;
            break;
          }
        }
      }

      if (!flag) {
        if (!result.otherPhone) result.otherPhone = numbers[i];
        else if (!result.homePhone) result.homePhone = numbers[i];
        else result.notePhone += numbers[i] + ',';
      }
      i++;
    }

    console.log('PHONE NUMBERS SEPARATION', result);

    return [result, null];
  } catch (err) {
    logger.error(`Error while seperating phone numbers: `, err);
    return [null, err.message];
  }
};

//seperatePhoneNumbers('+91 804-020-2020,+91 804-168-2349');

module.exports = seperatePhoneNumbers;
