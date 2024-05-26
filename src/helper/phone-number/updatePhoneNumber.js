// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models/');

// Repositories
const LeadPhoneNumberRepository = require('../../repository/lead-pn.repository');
const Repository = require('../../repository');

// Helpers and services
const getTimezoneFromNumber = require('./getTimezoneFromNumber');
const createPhoneNumber = require('./createPhoneNumber');
const formatForCreate = require('./formatForCreate');

const updatePhoneNumber = async (phone_number, type, lead_id) => {
  try {
    let [timezone, errForTimezone] = await getTimezoneFromNumber(phone_number);
    if (errForTimezone) return [null, errForTimezone];

    const [leadPhoneNumberUpdated, errForLeadPhoneNumberUpdated] =
      await Repository.update({
        tableName: [DB_TABLES.LEAD_PHONE_NUMBER],
        query: {
          lead_id,
          type,
        },
        updateObject: {
          phone_number,
          timezone,
        },
      });
    if (errForLeadPhoneNumberUpdated)
      return [null, errForLeadPhoneNumberUpdated];

    if (leadPhoneNumberUpdated[0] === 0)
      return await createPhoneNumber(phone_number, type, lead_id);

    return [true, null];
  } catch (err) {
    logger.error(`Error while updating phone number in db: `, err);
    return [null, err.message];
  }
};

const updatePhoneNumberUsingId = async (
  lpn_id,
  lead_id,
  phone_number,
  is_primary
) => {
  try {
    let [timezone, errForTimezone] = await getTimezoneFromNumber(phone_number);

    // * Set is_primary to false for all phone numbers of the lead as false. If any lead has a primary number it would be updated after.
    if (is_primary)
      await LeadPhoneNumberRepository.updatePhoneNumber(
        { lead_id },
        { is_primary: false }
      );
    let [updatePhoneNumber, errForUpdatePhoneNumber] =
      await LeadPhoneNumberRepository.updatePhoneNumber(
        { lpn_id, lead_id },
        {
          phone_number,
          timezone,
          is_primary,
        }
      );
    if (errForTimezone) return [null, errForTimezone];
    return [true, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while updating phone number in db: `, err);
    return [null, err.message];
  }
};

const bulkUpsertPhoneNumbers = async ({ phone_numbers, lead_id }) => {
  let t = await sequelize.transaction();
  try {
    // Fetch all phone numbers and create an array of deletables
    let lpn_map = phone_numbers
      ?.filter((phone_number) => phone_number.lpn_id)
      ?.map((phone_number) => phone_number.lpn_id);
    let [storedPhones, errForStoredPhones] = await Repository.fetchAll({
      tableName: DB_TABLES.LEAD_PHONE_NUMBER,
      query: {
        lead_id,
      },
      extras: {
        attributes: ['lpn_id'],
      },
    });
    if (errForStoredPhones) {
      t.rollback();
      return ['', 'An error occured while fetching all phone numbers'];
    }
    storedPhones = storedPhones.map((phone) => phone.lpn_id);
    // Get Deletables
    let deletablePhones = storedPhones.filter((lpn) => !lpn_map?.includes(lpn));

    let [upsertablePhones, errForUpsertablePhones] = await formatForCreate(
      phone_numbers,
      lead_id,
      false
    );

    if (errForUpsertablePhones) {
      t.rollback();
      return [null, 'Error while formatting phone numbers for bulk create'];
    }

    const [upsertedPhones, errForUpsertedPhones] = await Repository.bulkCreate({
      tableName: DB_TABLES.LEAD_PHONE_NUMBER,
      createObject: upsertablePhones,
      t,
      extras: {
        updateOnDuplicate: [
          'lpn_id',
          'phone_number',
          'timezone',
          'type',
          'is_primary',
          'lead_id',
        ],
      },
    });

    if (errForUpsertedPhones) {
      t.rollback();
      return [null, 'Error while creating a phone number'];
    }

    // Delete Phones
    const [deletedPhones, errForDeletedPhones] = await Repository.destroy({
      tableName: DB_TABLES.LEAD_PHONE_NUMBER,
      query: {
        lpn_id: {
          [Op.in]: deletablePhones,
        },
      },
      t,
    });

    if (errForDeletedPhones) {
      t.rollback();
      return [null, 'Error while Deleting a phone number'];
    }

    t.commit();
    logger.info('Phone Numbers Created and deleted');
    return [
      {
        upsertedPhones,
        deletedPhones,
      },
      null,
    ];
  } catch (err) {
    t.rollback();
    logger.error('An error occured while bulk upserting phone numbers', err);
    return [null, 'An error occured while bulk upserting phone numbers'];
  }
};

module.exports = {
  updatePhoneNumber,
  updatePhoneNumberUsingId,
  bulkUpsertPhoneNumbers,
};
