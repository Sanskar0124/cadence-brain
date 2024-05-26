// Utils
const logger = require('../../utils/winston');

// Helpers and services
const updatePhoneNumber = require('./updatePhoneNumber');

const updatePhoneNumbers = async (numbers, lead_id) => {
  try {
    let promiseArray = [];
    if (numbers.Phone || numbers.Phone === '')
      promiseArray.push(updatePhoneNumber(numbers.Phone, 'Phone', lead_id));
    if (numbers.MobilePhone || numbers.MobilePhone === '')
      promiseArray.push(
        updatePhoneNumber(numbers.MobilePhone, 'MobilePhone', lead_id)
      );
    if (numbers.OtherPhone || numbers.OtherPhone === '')
      promiseArray.push(
        updatePhoneNumber(contact.OtherPhone, 'OtherPhone', lead_id)
      );
    if (numbers.HomePhone || numbers.HomePhone === '')
      promiseArray.push(
        updatePhoneNumber(contact.HomePhone, 'HomePhone', lead_id)
      );
    if (numbers.AssistantPhone || numbers.AssistantPhone === '')
      promiseArray.push(
        updatePhoneNumber(numbers.AssistantPhone, 'AssistantPhone', lead_id)
      );
    await Promise.all(promiseArray);
    return [true, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while updating phone numbers: `, err);
    return [null, err.message];
  }
};

module.exports = updatePhoneNumbers;
