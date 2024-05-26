const { FRONTEND_URL } = require('../../utils/config');
const logger = require('../../utils/winston');

const { CRM_INTEGRATIONS, HIRING_INTEGRATIONS } = require('../../utils/enums');
const getPrimaryEmail = require('../lead/getPrimaryEmail');
const getPrimaryPhoneNumber = require('../lead/getPrimaryPhoneNumber');
const crmUrlHelper = require('../crmUrl');

const getCustomTaskDescription = ({
  lead,
  cadence,
  integration_type,
  instance_url,
  portal_id,
}) => {
  try {
    if (!lead) return [null, 'Lead is required.'];
    let crm_url = '';
    let errForUrl = null;
    switch (integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE: {
        [crm_url, errForUrl] = crmUrlHelper.getSalesforceUrl(
          instance_url,
          lead
        );
        break;
      }
      case CRM_INTEGRATIONS.PIPEDRIVE: {
        [crm_url, errForUrl] = crmUrlHelper.getPipedriveUrl(instance_url, lead);
        break;
      }
      case CRM_INTEGRATIONS.HUBSPOT: {
        [crm_url, errForUrl] = crmUrlHelper.getHubspotUrl(portal_id, lead);
        break;
      }
      case CRM_INTEGRATIONS.SELLSY: {
        [crm_url, errForUrl] = crmUrlHelper.getSellsyUrl(lead);
        break;
      }
      case CRM_INTEGRATIONS.GOOGLE_SHEETS: {
        [crm_url, errForUrl] = crmUrlHelper.getGoogleSheetsUrl(cadence);
        break;
      }
      case CRM_INTEGRATIONS.EXCEL: {
        [crm_url, errForUrl] = [null, null];
        break;
      }
      case CRM_INTEGRATIONS.ZOHO: {
        [crm_url, errForUrl] = crmUrlHelper.getZohoUrl(lead);
        break;
      }
      case HIRING_INTEGRATIONS.BULLHORN: {
        [crm_url, errForUrl] = crmUrlHelper.getBullhornUrl(lead);
        break;
      }
      default: {
        return [null, 'Invalid integration type'];
      }
    }
    let description = `
Name: ${lead.first_name} ${lead.last_name}
Phone: ${getPrimaryPhoneNumber(lead, true)[0]}
Email: ${getPrimaryEmail(lead, true)[0]}
Cadence Name: ${cadence?.name ?? ''}
URL: ${FRONTEND_URL}/crm/leads/${lead.lead_id}
`;
    if (crm_url) {
      description += `CRM URL: ${crm_url}`;
    }

    description = description.replace(/\s{2,}/g, '');

    return [description, null];
  } catch (err) {
    logger.error('An error occurred while making crm URL:', err);
    return [null, err];
  }
};

module.exports = getCustomTaskDescription;
