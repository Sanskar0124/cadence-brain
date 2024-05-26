// Utils
const logger = require('../../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../../utils/enums');

// Helpers and Services
const { searchContact } = require('../../../grpc/v2/crm-integration');

const searchContacts = async ({
  access_token,
  order,
  direction,
  limit,
  offset,
  filters,
  fields,
}) => {
  try {
    const [data, err] = await searchContact({
      integration_type: CRM_INTEGRATIONS.SELLSY,
      integration_data: {
        access_token,
        order,
        direction,
        limit,
        offset,
        filters,
        fields,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(`Error while searching contacts form sellsy: `, err);
    return [null, err.message];
  }
};

module.exports = searchContacts;
