// Utils
const logger = require('../../utils/winston');
const { CADENCE_LEAD_STATUS } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repositories
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');

const removeLeadFromCadence = async (leads, cadence_ids) => {
  try {
    // const [leadsUpdate, errForLeadsUpdate] = await LeadRepository.updateLeads(
    //   {
    //     lead_id: {
    //       [Op.in]: leads.map((lead) => lead.lead_id),
    //     },
    //   },
    //   { stopped_cadence: true }
    // );

    // if (errForLeadsUpdate) {
    //   return [null, errForLeadsUpdate];
    // }

    await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
      {
        lead_id: {
          [Op.in]: leads.map((lead) => lead.lead_id),
        },
        cadence_id: {
          [Op.in]: cadence_ids,
        },
      },
      {
        status: CADENCE_LEAD_STATUS.STOPPED,
      }
    );

    return [`Removed leads from cadence successfully.`, null];
  } catch (err) {
    logger.error(`Error while removing lead from cadence: ${err.message}.`);
    return [null, err.message];
  }
};

module.exports = removeLeadFromCadence;
