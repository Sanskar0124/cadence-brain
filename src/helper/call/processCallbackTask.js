//Utils
const logger = require('../../utils/winston');
const { CALLBACK_DEVICES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

// Helper and Services
const LeadHelper = require('../lead');
const Ringover = require('../../services/Ringover');

const processCallbackTask = async ({ salesPerson, lead, node, task }) => {
  try {
    let { duration: timeout } = node.data;
    if (!timeout) timeout = 60;

    let device = salesPerson.callback_device;
    if (!device) device = CALLBACK_DEVICES.APP;

    if (!salesPerson.primary_phone_number)
      return [null, `SkipError: Unable to find primary_phone_number`];
    if (!salesPerson.ringover_user_id)
      return [null, `SkipError: Unable to find ringover_user_id`];

    const [leadPrimaryNumber, leadPrimaryNumberErr] =
      LeadHelper.getPrimaryPhoneNumber(lead, true);
    if (leadPrimaryNumberErr)
      return [null, `SkipError: Unable to find primaryNumber`];
    if (!leadPrimaryNumber)
      return [null, `SkipError: leadPrimaryNumber is required`];

    //fetching ringover_numbers
    const [userTokens, userTokenErr] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: { user_id: salesPerson.user_id },
      extras: {
        attributes: ['encrypted_ringover_api_key', 'ringover_api_key'],
      },
    });
    if (userTokenErr) return [null, `SkipError: ${userTokenErr}`];
    if (!userTokens.ringover_api_key)
      return [null, `SkipError: Unable to find ringover_api_key`];

    const [ringoverUser, ringoverUserErr] = await Ringover.User.get(
      userTokens.ringover_api_key,
      salesPerson.ringover_user_id
    );
    if (ringoverUserErr) return [null, `SkipError: ${ringoverUserErr}`];

    //search if primary_phone_number wxists in `ringover_numbers` || match it with raw format
    const salesPersonPrimaryNumber = ringoverUser.numbers.find(
      (number) =>
        parseInt(number.format.raw) ===
        parseInt(salesPerson.primary_phone_number)
    );
    if (!salesPersonPrimaryNumber)
      return [
        null,
        `SkipError: user primary number = ${
          salesPerson.primary_phone_number
        } not found in ringover_numbers= ${ringoverUser.numbers.map(
          (number) => number.format.raw
        )}`,
      ];

    //exectute callback
    const [callbackRes, callbackErr] = await Ringover.Call.createCallback({
      from_number: salesPersonPrimaryNumber.format.raw,
      to_number: parseInt(leadPrimaryNumber),
      timeout,
      device,
      ringover_api_key: userTokens.ringover_api_key,
    });
    if (callbackErr) return [null, `SkipError: ${callbackErr}`];

    const resData = {
      from: salesPersonPrimaryNumber.format.raw,
      to: parseInt(leadPrimaryNumber),
      timeout,
      device,
      ...callbackRes,
    };
    return [resData, null];
  } catch (err) {
    logger.error(`Error while processing callback task: ${err.message}`);
    return [null, `SkipError: ${err.message}`];
  }
};

module.exports = processCallbackTask;
