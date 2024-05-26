// Utils
const logger = require('../../../utils/winston');
const { PROFILE_IMPORT_TYPES } = require('../../../utils/enums');

// Packages
const axios = require('axios');

const createLead = async (
  lead,
  salesforceFieldMapForLead,
  access_token,
  instance_url
) => {
  try {
    let res = await axios.post(
      `${instance_url}/services/data/v48.0/sobjects/Lead`,
      lead,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return [res.data, null];
  } catch (err) {
    logger.error(`Error data: ` + JSON.stringify(err?.response?.data, null, 4));
    if (err?.response?.data?.[0]?.errorCode === 'DUPLICATES_DETECTED') {
      logger.error(`Duplicate detected in salesforce.`);

      let data = {};
      if (
        err?.response?.data?.[0]?.duplicateResut?.matchResults?.[0]
          ?.entityType === 'Contact'
      )
        data = {
          type: PROFILE_IMPORT_TYPES.CONTACT,
          salesforce_contact_id:
            err?.response?.data?.[0]?.duplicateResut?.matchResults?.[0]
              ?.matchRecords?.[0]?.record?.Id,
        };
      else if (
        err?.response?.data?.[0]?.duplicateResut?.matchResults?.[0]
          ?.entityType === 'Lead'
      )
        data = {
          type: PROFILE_IMPORT_TYPES.LEAD,
          salesforce_lead_id:
            err?.response?.data?.[0]?.duplicateResut?.matchResults?.[0]
              ?.matchRecords?.[0]?.record?.Id,
        };
      return [data, 'DUPLICATES_DETECTED'];
    }

    if (
      err?.response?.data?.[0]?.fields[0] ===
      salesforceFieldMapForLead.size?.name
    )
      return [null, `Please select valid Account size`];

    const msg = err?.response?.data?.[0]?.message ?? err.message;
    return [null, msg];
  }
};

module.exports = createLead;
