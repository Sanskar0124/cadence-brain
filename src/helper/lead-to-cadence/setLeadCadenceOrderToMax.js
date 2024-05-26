// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { CADENCE_LEAD_STATUS } = require('../../utils/enums');
const { LEAD_CADENCE_ORDER_MAX } = require('../../utils/constants');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// Helpers And Services
const {
  updateCadenceMemberStatusInSalesforceUsingIntegrationId,
} = require('../cadence/updateCadenceMemberStatusUsingIntegrationId');

const setLeadCadenceOrderToMax = async (query, t) => {
  try {
    const [leadCadenceLinks, errForLeadCadenceLinks] =
      await Repository.fetchAll({
        tableName: DB_TABLES.LEADTOCADENCE,
        include: {
          [DB_TABLES.LEAD]: {
            attributes: [
              'lead_id',
              'user_id',
              'salesforce_lead_id',
              'salesforce_contact_id',
            ],
          },
          [DB_TABLES.CADENCE]: {},
        },
        query,
        t,
      });
    if (errForLeadCadenceLinks) return [null, errForLeadCadenceLinks];

    for (let leadCadenceLink of leadCadenceLinks) {
      if (leadCadenceLink?.lead_cadence_order === LEAD_CADENCE_ORDER_MAX) {
        logger.error(
          `Lead cadence order for ${leadCadenceLink.lead_cadence_id} is set as max already.`
        );
        continue;
      }
      const lead = leadCadenceLink?.Leads?.[0];
      const cadence = leadCadenceLink.Cadences?.[0];
      //console.log(lead);

      if (!lead) {
        logger.error(
          `Lead not found for leadCadenceLink: ${leadCadenceLink.lead_cadence_id}`
        );
        continue;
      }
      if (!cadence) {
        logger.error(
          `Cadence not found for leadCadenceLink: ${leadCadenceLink.lead_cadence_id}`
        );
        continue;
      }

      // * stop this cadence for lead
      const [data, err] = await Repository.update({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: {
          lead_id: lead?.lead_id,
          cadence_id: cadence?.cadence_id,
        },
        updateObject: {
          status: CADENCE_LEAD_STATUS.STOPPED,
          lead_cadence_order: LEAD_CADENCE_ORDER_MAX, // * update lead_cadence_order to max
        },
        t,
      });

      // * fetch lead-cadence-links
      const [leadCadenceIds, errForLeadCadenceIds] = await Repository.fetchAll({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: {
          cadence_id: leadCadenceLink?.cadence_id,
          lead_cadence_order: {
            [Op.ne]: LEAD_CADENCE_ORDER_MAX,
          },
          created_at: {
            [Op.gt]: leadCadenceLink?.created_at,
          },
        },
        include: {
          [DB_TABLES.LEAD]: {
            where: {
              user_id: lead?.user_id,
            },
          },
        },
        t,
      });

      await Repository.update({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: {
          lead_cadence_id: {
            [Op.in]: leadCadenceIds.map(
              (leadCadenceId) => leadCadenceId?.lead_cadence_id
            ),
          },
        },
        updateObject: {
          // * decrement lead_cadence_order for all leads after the current lead by 1
          lead_cadence_order: sequelize.literal(`lead_cadence_order - 1`),
        },
        t,
      });

      await updateCadenceMemberStatusInSalesforceUsingIntegrationId(
        lead,
        cadence,
        CADENCE_LEAD_STATUS.STOPPED
      );
    }

    logger.info(`Updated Lead status.`);
    return [`Updated Lead status.`, null];
  } catch (err) {
    logger.error(`Error while settings lead cadence order to max: `, err);
    return [
      null,
      `Error while settings lead cadence order to max: ${err.message}. `,
    ];
  }
};

//setLeadCadenceOrderToMax({ lead_id: 3 }, null);

module.exports = setLeadCadenceOrderToMax;
