// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');
const { sequelize } = require('../../db/models');

/**
 *
 * @param {Array} leadIds
 * @param {Array} accountIds
 * @param {Object} t
 */
const deleteAllLeadInfo = async ({ leadIds = [], accountIds = [], t }) => {
  try {
    // if leadIds is not an array
    if (!Array.isArray(leadIds)) return [null, `leadIds must be an array`];
    // if leadIds is an empty array
    if (!leadIds?.length) return [null, `leadIds must have length > 0`];

    let isUniqueAccountPresent = false;
    let accountsPromise = null;

    let accountQuery = {
      account_id: {
        [Op.in]: accountIds,
      },
    };

    // used when cadence is deleted
    if (!accountIds?.length) {
      accountQuery = {
        lead_id: {
          [Op.in]: leadIds,
        },
        account_id: {
          [Op.ne]: null,
        },
      };
    }

    // delete all accounts from accountIds, if account is linked with only 1 lead
    // fetch accounts from accountIds which are linked with only 1 lead
    const [accountIdsToDelete, errForAccountIdsToDelete] =
      await Repository.fetchAll({
        tableName: DB_TABLES.LEAD,
        query: accountQuery,
        extras: {
          group: ['account_id'],
          having: sequelize.literal(`count(1)=1`),
          //logging: console.log,
          attributes: ['account_id'],
        },
        t,
      });
    // if no error has occured and accountIds is an array
    if (!errForAccountIdsToDelete && Array.isArray(accountIdsToDelete))
      isUniqueAccountPresent = true;

    if (isUniqueAccountPresent) {
      accountsPromise = Repository.destroy({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          account_id: {
            [Op.in]: accountIdsToDelete?.map(
              (accountIdToDelete) => accountIdToDelete.account_id
            ),
          },
        },
        t,
      });
    }

    const leadEmailPromise = Repository.destroy({
      tableName: DB_TABLES.LEAD_EMAIL,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    const leadPhonePromise = Repository.destroy({
      tableName: DB_TABLES.LEAD_PHONE_NUMBER,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    // * delete all activities
    const activityPromise = Repository.destroy({
      tableName: DB_TABLES.ACTIVITY,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    // * delete all emails
    const emailPromise = Repository.destroy({
      tableName: DB_TABLES.EMAIL,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    // * delete all notes
    const notesPromise = Repository.destroy({
      tableName: DB_TABLES.NOTE,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    // * delete all tasks
    const tasksPromise = Repository.destroy({
      tableName: DB_TABLES.TASK,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    // * delete all status
    const statusPromise = Repository.destroy({
      tableName: DB_TABLES.STATUS,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    //* delete all leads
    const leadPromise = Repository.destroy({
      tableName: DB_TABLES.LEAD,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    // * delete all LeadtoCadences
    const leadToCadencePromise = Repository.destroy({
      tableName: DB_TABLES.LEADTOCADENCE,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    // * delete all conversations
    const conversationsPromise = Repository.destroy({
      tableName: DB_TABLES.CONVERSATION,
      query: {
        lead_id: {
          [Op.in]: leadIds,
        },
      },
      t,
    });

    await Promise.all([
      accountsPromise,
      leadEmailPromise,
      leadPhonePromise,
      activityPromise,
      emailPromise,
      notesPromise,
      statusPromise,
      conversationsPromise,
      leadPromise,
      leadToCadencePromise,
      tasksPromise,
    ]);

    logger.info(`Deleted all leads info successfully.`);
    return ['Deleted all leads info successfully.', null];
  } catch (err) {
    logger.error(`Error while deleting all leads info: `, err);
    return [null, err.message];
  }
};

module.exports = deleteAllLeadInfo;
