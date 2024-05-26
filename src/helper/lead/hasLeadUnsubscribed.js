// Utils
const logger = require('../../utils/winston');

// Repository
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');

const hasLeadUnsubscribed = async (lead_id) => {
  try {
    let [links, errLink] =
      await LeadToCadenceRepository.getLeadToCadenceLinkByQuery({
        lead_id,
        unsubscribed: 1,
      });

    if (errLink) return [null, errLink.message];

    if (links.length > 0) return [true, null];
    else return [false, null];
  } catch (err) {
    logger.error(
      `Error while checking if the lead has unsubscribed before: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = hasLeadUnsubscribed;
