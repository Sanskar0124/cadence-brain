// Utils
const logger = require('../../utils/winston');
const { SNOV_ID, SNOV_SECRET } = require('../../utils/config');

// Helpers and Services
const SnovService = require('../../services/Snov');
const HunterService = require('../../services/Hunter');

const fetchValidEmails = async ({ lead, SNOV_ID, SNOV_SECRET, HUNTER_KEY }) => {
  try {
    if (lead?.linkedinUrl) {
      // fetch valid email from snov
      const [validEmailFromSnov, _] =
        await SnovService.fetchValidEmailsFromLinkedinUrl({
          linkedinUrl: lead.linkedinUrl,
          SNOV_ID,
          SNOV_SECRET,
        });
      if (validEmailFromSnov) return [validEmailFromSnov, null];
    }

    if (lead?.firstName && lead?.lastName && lead?.companyUrl) {
      // fetch valid email from hunter
      const [validEmailFromHunter, _] = await HunterService.fetchValidEmails({
        lead,
        HUNTER_KEY,
      });
      if (validEmailFromHunter) return [validEmailFromHunter, null];
    }

    return [null, `No valid emails found.`];
  } catch (err) {
    logger.error(`Error while fetching valid emails: `, err);
    return [null, err.message];
  }
};

module.exports = fetchValidEmails;
