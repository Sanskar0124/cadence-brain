// Utils
const logger = require('../../utils/winston');

// Repositories
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');

// Helpers and Services
const JsonHelper = require('../json');

const getCadenceUsers = async (cadence_id) => {
  try {
    if (!cadence_id) return [null, `Invalid cadence id: ${cadence_id}.`];

    // * get leads for the cadence
    const [cadenceLeads, errForCadenceLeads] =
      await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery(
        {
          cadence_id,
        },
        {}
      );

    if (errForCadenceLeads) return [null, errForCadenceLeads];

    let user_ids = [];

    // * seperate leads from cadenceLeads
    cadenceLeads?.map((cadenceLead) => {
      cadenceLead = JsonHelper.parse(cadenceLead);
      if (cadenceLead?.Leads && cadenceLead?.Leads?.length > 0) {
        const lead = cadenceLead.Leads[0];
        lead.lead_cadence_status = cadenceLead?.status;
        if (cadenceLead.Leads[0].User) user_ids.push(lead.User.user_id);
      }
    });

    return [[...new Set(user_ids)], null];
  } catch (err) {
    logger.error(`Error while fetching cadence users: `, err);
    return [null, err.message];
  }
};

module.exports = getCadenceUsers;
