// Utils
const logger = require('../../utils/winston');

// Services
const sellsyService = require('../../services/Sellsy');

const getCustomFields = async ({ access_token, body }) => {
  try {
    let { sellsy_contact_id, contact_custom_object } = body;

    let sellsyCompany, errForSellsyCompany;
    let contactCustomIds = '';
    let companyCustomIds = '';

    for (let i = 0; i < contact_custom_object.length; i++) {
      if (contact_custom_object[i].sellsy_endpoint === 'contact') {
        if (contact_custom_object[i].sellsy_field_id) {
          contactCustomIds += `&embed[]=cf.${contact_custom_object[i].sellsy_field_id}`;
        }
      } else {
        if (contact_custom_object[i].sellsy_field_id) {
          companyCustomIds += `&embed[]=cf.${contact_custom_object[i].sellsy_field_id}`;
        }
      }
    }

    const [sellsyContact, errForSellsyContact] =
      await sellsyService.getContactCustomFields({
        access_token,
        contact_id: sellsy_contact_id,
        embed: 'embed[]=smart_tags' + contactCustomIds,
      });
    if (errForSellsyContact)
      return [null, 'Unable to fetch custom contact from Sellsy'];

    const [contactCompanyId, errForContactCompanyId] =
      await sellsyService.getCompanyIdUsingContactId({
        access_token,
        contact_id: sellsy_contact_id,
      });
    if (errForContactCompanyId) sellsyCompany = {};

    if (contactCompanyId) {
      [sellsyCompany, errForSellsyCompany] =
        await sellsyService.getAccountCustomFields({
          access_token,
          company_id: contactCompanyId,
          embed: 'embed[]=smart_tags' + companyCustomIds,
        });
      if (errForSellsyCompany) sellsyCompany = {};
    }

    return [{ sellsyContact, sellsyCompany }, null];
  } catch (err) {
    logger.error(
      'An error occurred while fetching field map for company from user: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = getCustomFields;
