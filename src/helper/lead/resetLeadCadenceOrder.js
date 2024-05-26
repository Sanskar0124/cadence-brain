// Utils
const logger = require('../../utils/winston');
const { LEAD_CADENCE_ORDER_MAX } = require('../../utils/constants');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');

const resetLeadCadenceOrder = async (lead, cadence_id) => {
  try {
    if (!lead) return [null, `Lead not provided.`];
    // * get link for cadence_id and lead_id
    let [leadCadenceLink, errForLeadCadenceLink] =
      await LeadToCadenceRepository.getLeadToCadenceLinkByQuery({
        cadence_id,
        lead_id: lead?.lead_id,
      });

    if (errForLeadCadenceLink) return [null, errForLeadCadenceLink];

    if (!leadCadenceLink?.length)
      return [null, `No lead-to-cadence links found.`];

    leadCadenceLink = leadCadenceLink?.[0];

    // * If its not paused, dont do anything
    if (leadCadenceLink?.lead_cadence_order !== LEAD_CADENCE_ORDER_MAX)
      return [`Not paused, so didn't resumed.`, null];

    let lead_cadence_order = 0;

    let [lastLeadCadenceLink, errForLastLeadCadenceLink] =
      await LeadToCadenceRepository.getLeadToCadenceLinkByLeadQuery(
        {
          cadence_id,
          lead_cadence_order: {
            [Op.lt]: LEAD_CADENCE_ORDER_MAX,
          },
          created_at: {
            [Op.gt]: leadCadenceLink?.created_at,
          },
        },
        {
          user_id: lead?.user_id,
        }
      );

    if (errForLastLeadCadenceLink) return [null, errForLastLeadCadenceLink];

    // * If no last task then this may be last lead in the cadence or only lead in the cadence
    if (lastLeadCadenceLink)
      lead_cadence_order = lastLeadCadenceLink?.lead_cadence_order;
    else {
      let [previousLeadCadenceLink, errForPreviousLeadCadenceLink] =
        await LeadToCadenceRepository.getLastLeadToCadenceByLeadQuery(
          {
            cadence_id,
            lead_cadence_order: {
              [Op.lt]: LEAD_CADENCE_ORDER_MAX,
            },
            created_at: {
              [Op.lt]: leadCadenceLink?.created_at,
            },
          },
          {
            user_id: lead?.user_id,
          }
        );

      if (errForPreviousLeadCadenceLink)
        return [null, errForLastLeadCadenceLink];

      previousLeadCadenceLink = previousLeadCadenceLink?.[0];

      // * If no previous link found then, this will be only lead in the cadence
      if (previousLeadCadenceLink)
        lead_cadence_order = previousLeadCadenceLink?.lead_cadence_order + 1;
      else lead_cadence_order = 1;
    }

    // * fetch lead-cadence-links
    const [leadCadenceIds, errForLeadCadenceIds] =
      await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery(
        {
          cadence_id,
          lead_cadence_order: {
            [Op.ne]: LEAD_CADENCE_ORDER_MAX,
          },
          created_at: {
            [Op.gt]: leadCadenceLink?.created_at,
          },
        },
        {
          user_id: lead.user_id,
        }
      );

    if (!errForLeadCadenceIds) {
      // * update all links greated than created_at of fetched link, by incrementing their lead_cadence_order by 1
      await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
        {
          lead_cadence_id: {
            [Op.in]: leadCadenceIds.map(
              (leadCadenceId) => leadCadenceId?.lead_cadence_id
            ),
          },
        },
        {
          lead_cadence_order: sequelize.literal(`lead_cadence_order + 1`),
        }
      );

      await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
        {
          lead_id: lead?.lead_id,
          cadence_id,
        },
        {
          lead_cadence_order,
        }
      );
    }
  } catch (err) {
    logger.error(`Error while resetting lead-cadence-order: `, err);
    return [null, err.message];
  }
};

module.exports = resetLeadCadenceOrder;
