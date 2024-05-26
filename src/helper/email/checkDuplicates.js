// Repositories
const LeadEmailRepository = require('../../repository/lead-em.repository');
const LeadRepository = require('../../repository/lead.repository');

const checkDuplicates = async function (email, lead_id) {
  try {
    const [fetchedLead, errForFetchedLead] =
      await LeadRepository.getLeadByQuery({
        lead_id,
      });
    if (fetchedLead) {
      const [duplicateLeadEmail, errForDuplicateLeadEmail] =
        await LeadEmailRepository.fetchLeadEmailByLeadQuery(
          {
            email_id: email,
          },
          {
            user_id: fetchedLead.user_id,
          }
        );
      if (duplicateLeadEmail.length !== 0) return true;
    }
    return false;
  } catch (err) {
    logger.error('Error while checking duplicate email: ', err);
    return false;
  }
};

module.exports = checkDuplicates;
