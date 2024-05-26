// Utils
const logger = require('../../utils/winston');
const {
  LEAD_TYPE,
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  SALESFORCE_SOBJECTS,
  ACCOUNT_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

// Helpers and services
const CompanyFieldMapHelper = require('../company-field-map');
const PhoneNumberHelper = require('../phone-number');
const LeadEmailHelper = require('../email');
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');
const SalesforceHelper = require('../salesforce');

const createLead = async (lead, leadSalesforceMap, company_id, t) => {
  try {
    // Finding or creating account
    let account, errForAccount;
    [account, errForAccount] = await Repository.fetchOne({
      tableName: DB_TABLES.ACCOUNT,
      query: {
        name: lead?.[leadSalesforceMap?.company],
        salesforce_account_id: null,
        company_id,
        integration_type: ACCOUNT_INTEGRATION_TYPES.SALESFORCE_LEAD_ACCOUNT,
      },
      t,
    });
    if (errForAccount)
      return [
        { createdLead: {}, account: {}, createdLink: {} },
        `Error while finding account: ${errForAccount}`,
      ];

    if (!account) {
      let integration_type = ACCOUNT_INTEGRATION_TYPES.SALESFORCE_LEAD_ACCOUNT;
      switch (lead.integration_type) {
        case LEAD_INTEGRATION_TYPES.GOOGLE_SHEETS_LEAD:
          integration_type = ACCOUNT_INTEGRATION_TYPES.GOOGLE_SHEETS_ACCOUNT;
          break;
        case LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON:
          integration_type = ACCOUNT_INTEGRATION_TYPES.PIPEDRIVE_ORGANIZATION;
          break;
        case LEAD_INTEGRATION_TYPES.EXCEL_LEAD:
          integration_type = ACCOUNT_INTEGRATION_TYPES.EXCEL_ACCOUNT;
          break;
      }
      [account, errForAccount] = await Repository.create({
        tableName: DB_TABLES.ACCOUNT,
        createObject: {
          name: lead?.[leadSalesforceMap?.company],
          size: lead?.[
            CompanyFieldMapHelper.getCompanySize({
              size: leadSalesforceMap?.size,
            })[0]
          ],
          phone_number: lead?.[leadSalesforceMap?.company_phone_number],
          url: lead?.[leadSalesforceMap?.url] ?? null,
          country: lead?.[leadSalesforceMap?.country],
          integration_type: ACCOUNT_INTEGRATION_TYPES.SALESFORCE_LEAD_ACCOUNT,
          zipcode: lead?.[leadSalesforceMap?.zip_code],
          user_id: lead.user_id,
          company_id,
        },
        t,
      });
    }
    if (errForAccount)
      return [
        { createdLead: {}, account: {}, createdLink: {} },
        `Error while creating account: ${errForAccount}`,
      ];

    // Creating lead
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        type: LEAD_TYPE.HEADER_FORM,
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.[leadSalesforceMap?.first_name],
        last_name: lead?.[leadSalesforceMap?.last_name] || '',
        full_name:
          lead?.[leadSalesforceMap?.first_name] ||
          '' + ' ' + lead?.[leadSalesforceMap?.last_name] ||
          '',
        linkedin_url: lead?.[leadSalesforceMap?.linkedin_url],
        verified: false,
        source_site: lead?.[leadSalesforceMap?.source_site],
        job_position: lead?.[leadSalesforceMap?.job_position],
        account_id: account.account_id,
        salesforce_lead_id: lead.salesforce_lead_id,
        duplicate: lead.duplicate,
        user_id: lead.user_id,
        integration_status: lead?.[leadSalesforceMap?.integration_status?.name],
        assigned_time: new Date(),
        integration_type: lead.integration_type,
        integration_id: lead.salesforce_lead_id,
        company_id,
      },
      t,
    });
    if (errForLead)
      return [
        { createdLead: {}, account: {}, createdLink: {} },
        `Error while creating lead: ${errForLead}`,
      ];

    //Creating lead phone numbers
    if (lead.phone_number?.length > 0) {
      const [numberArray, errForArray] =
        await PhoneNumberHelper.formatForCreate(
          lead.phone_number,
          createdLead.lead_id
        );
      const [_, errForNumbers] = await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_PHONE_NUMBER,
        createObject: numberArray,
        t,
      });
      if (errForNumbers)
        return [
          { createdLead: {}, account: {}, createdLink: {} },
          `Error while creating lead numbers: ${errForNumbers}`,
        ];
    }

    // Creating lead emails
    if (lead.emails?.length > 0) {
      const [emailsArray, errForEmailArray] =
        await LeadEmailHelper.formatForCreate(lead.emails, createdLead.lead_id);

      const [_, errForEmails] = await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_EMAIL,
        createObject: emailsArray,
        t,
      });
      if (errForEmails)
        return [
          {
            createdLead: {},
            account: {},
            createdLink: {},
          },
          `Error while creating lead emails: ${errForEmailArray}`,
        ];
    }

    let [unsubscribed, ___] = await hasLeadUnsubscribed(createdLead.lead_id);

    // Creating lead to cadence link
    const [createdLink, errForLink] = await Repository.create({
      tableName: DB_TABLES.LEADTOCADENCE,
      createObject: {
        lead_id: createdLead.lead_id,
        cadence_id: lead.cadence_id,
        status:
          lead.cadenceStatus === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        lead_cadence_order: lead.leadCadenceOrder,
        unsubscribed: unsubscribed ?? false,
      },
      t,
    });
    if (errForLink)
      return [
        { createdLead: {}, account: {}, createdLink: {} },
        `Error while creating lead to cadence link: ${errForLink}`,
      ];

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + createdLead.lead_id);

    const [status, errForStatus] = await Repository.create({
      tableName: DB_TABLES.STATUS,
      createObject: {
        lead_id: createdLead.lead_id,
        message: 'Created new lead',
        status: LEAD_STATUS.NEW_LEAD,
      },
      t,
    });
    if (errForStatus)
      return [
        { createdLead: {}, account: {}, createdLink: {} },
        `Error while creating status: ${errForStatus}.`,
      ];

    logger.info(`Lead status entry created.`);
    return [{ createdLead, account, createdLink }, null];
  } catch (err) {
    logger.error('Error while creating lead: ', err);
    return [{ createdLead: {}, account: {}, createdLink: {} }, err.message];
  }
};

module.exports = createLead;
