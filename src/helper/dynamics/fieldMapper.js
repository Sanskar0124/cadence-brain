// Utils
const logger = require('../../utils/winston');
const { DYNAMICS_ENDPOINTS } = require('../../utils/enums');

// Helper
const getCompanySize = require('../company-field-map/getCompanySize');
const JsonHelper = require('../../helper/json');

const fieldMapper = (data, dynamicsMap, type) => {
  try {
    let updatedContact = {
      first_name: data[dynamicsMap?.first_name],
      last_name: data[dynamicsMap?.last_name],
      linkedin_url: data[dynamicsMap?.linkedin_url],
      source_site: data[dynamicsMap?.source_site],
      job_position: data[dynamicsMap?.job_position],
      phone_numbers: [],
      emails: [],
    };

    dynamicsMap?.phone_numbers.forEach((phone_type) => {
      let phone_number = data[phone_type];
      if (phone_number) {
        updatedContact.phone_numbers.push({
          type: phone_type,
          phone_number,
        });
      }
    });

    dynamicsMap?.emails.forEach((email_type) => {
      let email_id = data[email_type];
      if (email_id) {
        updatedContact.emails.push({ type: email_type, email_id });
      }
    });

    if (type === DYNAMICS_ENDPOINTS.LEAD) {
      updatedContact.Account = {
        name: data[dynamicsMap?.account]?.length
          ? data[dynamicsMap?.account]
          : null,
        size: data[
          `${
            getCompanySize({
              size: dynamicsMap?.size,
            })[0]
          }`
        ],
        phone_number: data[dynamicsMap?.company_phone_number],
        url: data[dynamicsMap?.url],
        country: data[dynamicsMap?.country],
        zipcode: data[dynamicsMap?.zip_code],
      };

      updatedContact.Account = JsonHelper.clean(updatedContact.Account);
    }

    updatedContact.full_name =
      updatedContact?.first_name || updatedContact?.last_name
        ? `${updatedContact?.first_name || ''} ${
            updatedContact?.last_name || ''
          }`.trim()
        : null;

    const result = JsonHelper.clean(updatedContact);

    return [result, null];
  } catch (err) {
    logger.error('Error while mapping fields: ', err);
    return [null, err.message];
  }
};

module.exports = fieldMapper;
