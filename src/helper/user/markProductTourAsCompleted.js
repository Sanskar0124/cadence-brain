// Utils
const logger = require('../../utils/winston');
const { PRODUCT_TOUR_STATUSES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  PREFIX_FOR_PRODUCT_TOUR_DUMMY_LEAD_INTEGRATION_ID,
  INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
} = require('../../utils/constants');

// Packages
const { Op } = require('sequelize');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const deleteAllLeadInfo = require('../lead/deleteAllLeadInfo');

/**
  marks product tour as completed for a user
  @param user_id user_id of the user whose product tour needs to be marked as completed
  @param t sequelize.transaction
 */
const markProductTourAsCompleted = async ({ user_id, t }) => {
  try {
    // promises to resolve
    let promisesToResolve = [];

    // Step: update user's product tour status
    promisesToResolve.push(
      Repository.update({
        tableName: DB_TABLES.USER,
        query: { user_id },
        updateObject: {
          product_tour_status:
            PRODUCT_TOUR_STATUSES.AFTER_ONBOARDGING_COMPLETED,
          product_tour_step: null,
        },
        t,
      })
    );

    // Step: Delete dummy leads created for product tour
    // fetch leads to be deleted
    // dummy lead created for product tour will have integration_id in the format `product_tour_dummy_{user id of user to which lead belongs}_{lead_cadence_order}`
    const [leadsToBeDeleted, errForLeadsToBeDeleted] =
      await Repository.fetchAll({
        tableName: DB_TABLES.LEAD,
        query: {
          integration_id: {
            [Op.like]: `${PREFIX_FOR_PRODUCT_TOUR_DUMMY_LEAD_INTEGRATION_ID}_${user_id}%`,
          },
        },
        extras: {
          attributes: ['lead_id', 'integration_id', 'account_id'],
        },
        t,
      });
    if (errForLeadsToBeDeleted) [null, errForLeadsToBeDeleted]; //console.log(`Deleting leads: `, leadsToBeDeleted);
    // delete leads, if leads found
    if (leadsToBeDeleted?.length) {
      let leadIdsToDelete = [];
      let accountIdsToDelete = [];
      leadsToBeDeleted.map((lead) => {
        leadIdsToDelete.push(lead.lead_id);
        accountIdsToDelete.push(lead.account_id);
      });
      console.log({ leadIdsToDelete, accountIdsToDelete });
      promisesToResolve.push(
        deleteAllLeadInfo({
          leadIds: leadIdsToDelete,
          accountIds: accountIdsToDelete,
          t,
        })
      );
    }

    // Step: Update product tour cadence to set salesforce_cadence_id as null
    promisesToResolve.push(
      Repository.update({
        tableName: DB_TABLES.CADENCE,
        query: {
          user_id,
          salesforce_cadence_id: INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
        },
        updateObject: { salesforce_cadence_id: null },
        t,
      })
    );

    // resolve promises
    let resolvedPromises = await Promise.all(promisesToResolve);
    // looping through promises to check if any process failed
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
      console.log(data);
    }

    return [`Marked product tour as completed`, null];
  } catch (err) {
    logger.error(`Error while marking product tour as completed: `, err);
    return [null, err.message];
  }
};

module.exports = markProductTourAsCompleted;
