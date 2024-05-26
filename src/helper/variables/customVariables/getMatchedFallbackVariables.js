// Utils
const { FALLBACK_VARIABLES } = require('../../../utils/enums');
const getMatchedFallbackVariables = (variable, variables, fallback) => {
  let customVariableValue = '';
  const {
    //prospect
    first_name,
    last_name,
    company,
    signature,
    email,
    phone_number,
    occupation,
    owner,
    //account
    linkedin_url,
    account_linkedin_url,
    account_website_url,
    account_size,
    account_zipcode,
    account_country,
    account_phone_number,
    //sender
    sender_first_name,
    sender_last_name,
    sender_name,
    sender_email,
    sender_phone_number,
    sender_company,
    //Date variables
    today,
    today_day,
    tomorrow,
    tomorrow_day,
    fromTimezone,
    calendly_link,
    //other
    zoom_info,
  } = variables;
  switch (variable) {
    case FALLBACK_VARIABLES.FIRST_NAME:
      customVariableValue =
        first_name?.toString().length > 0 ? first_name : fallback;
      break;
    case FALLBACK_VARIABLES.LAST_NAME:
      customVariableValue =
        last_name?.toString().length > 0 ? last_name : fallback;
      break;
    case FALLBACK_VARIABLES.FULL_NAME:
      customVariableValue =
        `${first_name} ${last_name}`?.toString().length > 0
          ? `${first_name} ${last_name}`
          : fallback;
      break;
    case FALLBACK_VARIABLES.EMAIL:
      customVariableValue =
        email?.toString().length > 0 ? email?.toString() : fallback;
      break;
    case FALLBACK_VARIABLES.PHONE:
      customVariableValue =
        phone_number?.toString().length > 0
          ? phone_number?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.OWNER:
      customVariableValue =
        owner?.toString().length > 0 ? owner?.toString() : fallback;
      break;
    case FALLBACK_VARIABLES.LINKEDIN_URL:
      customVariableValue =
        linkedin_url?.toString().length > 0
          ? linkedin_url?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.OCCUPATION:
      customVariableValue =
        occupation?.toString().length > 0 ? occupation?.toString() : fallback;
      break;
    case FALLBACK_VARIABLES.COMPANY_LINKEDIN_URL:
      customVariableValue =
        account_linkedin_url?.toString().length > 0
          ? account_linkedin_url?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.WEBSITE:
      customVariableValue =
        account_website_url?.toString().length > 0
          ? account_website_url?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.SIZE:
      customVariableValue =
        account_size?.toString().length > 0
          ? account_size?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.ZIPCODE:
      customVariableValue =
        account_zipcode?.toString().length > 0
          ? account_zipcode?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.COUNTRY:
      customVariableValue =
        account_country?.toString().length > 0
          ? account_country?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.COMPANY_NAME:
      customVariableValue =
        company?.toString().length > 0 ? company?.toString() : fallback;
      break;
    case FALLBACK_VARIABLES.COMPANY_PHONE_NUMBER:
      customVariableValue =
        account_phone_number?.toString().length > 0
          ? account_phone_number?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.SENDER_FIRST_NAME:
      customVariableValue =
        sender_first_name?.toString().length > 0
          ? sender_first_name?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.SENDER_LAST_NAME:
      customVariableValue =
        sender_last_name?.toString().length > 0
          ? sender_last_name?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.SENDER_NAME:
      customVariableValue =
        sender_name?.toString().length > 0 ? sender_name?.toString() : fallback;
      break;
    case FALLBACK_VARIABLES.SENDER_EMAIL:
      customVariableValue =
        sender_email?.toString().length > 0
          ? sender_email?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.SENDER_PHONE_NUMBER:
      customVariableValue =
        sender_phone_number?.toString().length > 0
          ? sender_phone_number?.toString()
          : fallback;
      break;
    case FALLBACK_VARIABLES.SENDER_COMPANY:
      customVariableValue =
        sender_company?.toString().length > 0
          ? sender_company?.toString()
          : fallback;
      break;
    default:
      customVariableValue = '';
  }
  return customVariableValue;
};

module.exports = getMatchedFallbackVariables;
