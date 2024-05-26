const logger = require('../../utils/winston');

const getTimezoneFromNumber = require('../phone-number/getTimezoneFromNumber');

const formatForCreate = async (numbers, lead_id, set_primary = true) => {
  try {
    let numberList = [];
    let flag = 0;
    for (let numberObj of numbers) {
      let obj = numberObj;
      if (obj.phone_number == undefined || obj.phone_number === '')
        obj.phone_number = '';
      else if (flag === 0 && set_primary) {
        obj.is_primary = true;
        flag = 1;
      }
      if (!numberObj.timezone) {
        const [timezone, errForTimezone] = await getTimezoneFromNumber(
          numberObj.phone_number
        );
        obj.timezone = timezone;
      }
      obj.lead_id = lead_id;
      numberList.push(obj);
    }

    // If none of the phone number are valid, setting the first as primary
    if (flag === 0 && numberList.length && set_primary)
      numberList[0].is_primary = true;

    return [numberList, null];
  } catch (err) {
    logger.error(`Error while formating for create: `, err);
    return [null, err.message];
  }
};

module.exports = formatForCreate;
