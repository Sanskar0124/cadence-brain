// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// DB
const { sequelize } = require('../../db/models/');

// Repositories
const Repository = require('../../repository');
// Helpers and services
const { createEmailUsingType } = require('./createEmails');
const formatForCreate = require('./formatForCreate');

const updateEmail = async (email_id, type, lead_id) => {
  try {
    const [updatedEmail, errForUpdatedEmail] = await Repository.update({
      tableName: [DB_TABLES.LEAD_EMAIL],
      updateObject: {
        email_id,
        type,
      },
      query: {
        lead_id,
        type,
      },
    });
    if (errForUpdatedEmail) return [null, errForUpdatedEmail];

    // Todo: Check if the email is already present in the db. If yes, then update the email_id.
    if (updatedEmail[0] === 0)
      return await createEmailUsingType(email_id, lead_id, type);

    return [true, null];
  } catch (err) {
    logger.error(`Error while updating email in db: `, err);
    return [null, err.message];
  }
};

const updateEmailUsingId = async (lem_id, lead_id, email_id, is_primary) => {
  try {
    // * Set is_primary to false for all emails of the lead as false. If any lead has a primary email it would be updated after.
    if (is_primary)
      await Repository.update({
        tableName: [DB_TABLES.LEAD_EMAIL],
        updateObject: {
          is_primary: false,
        },
        query: {
          lead_id,
        },
      });

    await Repository.update({
      tableName: [DB_TABLES.LEAD_EMAIL],
      updateObject: {
        email_id,
        is_primary,
      },
      query: {
        lem_id,
      },
    });

    return [true, null];
  } catch (err) {
    logger.error(`Error while updating email in db: `, err);
    return [null, err.message];
  }
};

const bulkUpsertEmails = async ({ emails, lead_id }) => {
  let t = await sequelize.transaction();
  try {
    // Fetch all emails and create an array of deletables
    let lem_map = emails
      ?.filter((email) => email.lem_id)
      ?.map((email) => email.lem_id);
    let [storedEmails, errForStoredEmails] = await Repository.fetchAll({
      tableName: DB_TABLES.LEAD_EMAIL,
      query: {
        lead_id,
      },
      extras: {
        attributes: ['lem_id'],
      },
    });

    if (errForStoredEmails) {
      t.rollback();
      return ['', 'An error occured while fetching all emails'];
    }
    storedEmails = storedEmails.map((email) => email.lem_id);

    let [upsertableEmails, errForUpsertableEmails] = await formatForCreate(
      emails,
      lead_id,
      false
    );

    if (errForUpsertableEmails) {
      t.rollback();
      return [null, 'Error while formatting emails for bulk create'];
    }

    // Get Deletables
    let deletableEmails = storedEmails.filter((lem) => !lem_map?.includes(lem));

    const [upsertedEmails, errForUpsertedEmails] = await Repository.bulkCreate({
      tableName: DB_TABLES.LEAD_EMAIL,
      createObject: upsertableEmails,
      t,
      extras: {
        updateOnDuplicate: [
          'lem_id',
          'email_id',
          'type',
          'is_primary',
          'lead_id',
        ],
      },
    });

    if (errForUpsertedEmails) {
      t.rollback();
      return [null, 'Error while creating a emails'];
    }

    // Delete Emails
    const [deletedEmails, errForDeletedEmails] = await Repository.destroy({
      tableName: DB_TABLES.LEAD_EMAIL,
      query: {
        lem_id: {
          [Op.in]: deletableEmails,
        },
      },
      t,
    });

    if (errForDeletedEmails) {
      t.rollback();
      return [null, 'Error while deleting phone numbers'];
    }

    t.commit();
    logger.info('Emails Created and Deleted');
    return [
      {
        upsertedEmails,
        deletedEmails,
      },
      null,
    ];
  } catch (err) {
    t.rollback();
    logger.error('An error occured while bulk upserting emails', err);
    return [null, 'An error occured while bulk upserting emails'];
  }
};

module.exports = { updateEmail, updateEmailUsingId, bulkUpsertEmails };
