// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');

// Helpers and services
const getTimezoneFromNumber = require('./getTimezoneFromNumber');

const createPhoneNumber = async (phone_number, type, lead_id) => {
  try {
    let [_timezone, errForTimezone] = await getTimezoneFromNumber(phone_number);
    if (errForTimezone) return [null, errForTimezone];

    const [leadPhoneNumberCreated, errForLeadPhoneNumberCreated] =
      await Repository.create({
        tableName: [DB_TABLES.LEAD_PHONE_NUMBER],
        createObject: {
          phone_number,
          type,
          lead_id,
        },
      });

    if (errForLeadPhoneNumberCreated)
      return [null, errForLeadPhoneNumberCreated];

    return [leadPhoneNumberCreated, null];
  } catch (err) {
    logger.error(`Error while creating phone number in db: `, err);
    return [null, err.message];
  }
};

module.exports = createPhoneNumber;
