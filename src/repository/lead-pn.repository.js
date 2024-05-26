// Utils
const logger = require('../utils/winston');

// Models
const { Lead_phone_number, Lead } = require('../db/models');

// Helpers and services
const getTimezoneFromNumber = require('../helper/phone-number/getTimezoneFromNumber');

const createPhoneNumbers = async (numbers, lead_id) => {
  try {
    let numberList = [];
    let flag = 0;
    for (let numberObj of numbers) {
      let obj = numberObj;
      if (obj.phone_number == undefined || obj.phone_number === '')
        obj.phone_number = '';
      else if (flag === 0) {
        obj.is_primary = true;
        flag = 1;
      }

      const [timezone, errForTimezone] = await getTimezoneFromNumber(
        numberObj.phone_number
      );
      obj.timezone = timezone;
      obj.lead_id = lead_id;
      numberList.push(obj);
    }

    // If none of the phone number are valid, setting the first as primary
    if (flag === 0) numberList[0].is_primary = true;

    const createdNumbers = await Lead_phone_number.bulkCreate(numberList);
    return [createdNumbers, null];
  } catch (err) {
    logger.error(`Error while creating lead-pns: ${err.message}.`);
    return [null, err.message];
  }
};

const createAdditionalPhoneNumber = async (number, lead_id) => {
  try {
    let numberObj = {
      phone_number: number,
      lead_id,
    };
    const createdNumber = await Lead_phone_number.create(numberObj);
    return [createdNumber, null];
  } catch (err) {
    logger.error(`Error while creating adding lead-pn: ${err.message}.`);
    return [null, err.message];
  }
};

const fetchLeadPhoneNumbers = async (query) => {
  try {
    const numbers = await Lead_phone_number.findAll({
      where: query,
    });
    return [numbers, null];
  } catch (err) {
    logger.error(`Error while fetching lead-pns by query: ${err.message}.`);
    return [null, err.message];
  }
};

const fetchLeadsByPhoneNumber = async (query) => {
  try {
    const leads = await Lead_phone_number.findAll({
      where: query,
      include: Lead,
    });
    return [leads, null];
  } catch (err) {
    logger.error(`Error while fetching lead-pns by query: ${err.message}.`);
    return [null, err.message];
  }
};

const updatePhoneNumber = async (query, body) => {
  try {
    const data = await Lead_phone_number.update(body, {
      where: query,
    });
    return [data, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while updating lead-pns by query: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteLeadPhoneNumbers = async (query) => {
  try {
    const numbers = await Lead_phone_number.destroy({
      where: query,
    });
    return [numbers, null];
  } catch (err) {
    logger.error(`Error while deleting lead-pns by query: ${err.message}.`);
    return [null, err.message];
  }
};

const LeadPhoneNumberRepository = {
  createPhoneNumbers,
  createAdditionalPhoneNumber,
  fetchLeadPhoneNumbers,
  fetchLeadsByPhoneNumber,
  updatePhoneNumber,
  deleteLeadPhoneNumbers,
};

module.exports = LeadPhoneNumberRepository;
