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

// Packages
const { Op } = require('sequelize');

// Repository
const Repository = require('../../repository');

// Helpers and services
const CompanyFieldMapHelper = require('../company-field-map');
const PhoneNumberHelper = require('../phone-number');
const LeadEmailHelper = require('../email');
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');
const SalesforceHelper = require('../salesforce');

const createContact = async (lead, contactSalesforceMap, company_id, t) => {
  try {
    logger.info('Creating lead..');

    // * Fetch account salesforce map
    let [accountSalesforceMap, errFetchingSalesforceFieldMap] =
      await SalesforceHelper.getFieldMapForCompanyFromUser(
        lead.user_id,
        SALESFORCE_SOBJECTS.ACCOUNT
      );
    if (errFetchingSalesforceFieldMap)
      return [null, errFetchingSalesforceFieldMap];

    // Finding or creating account
    let account, errForAccount;
    [account, errForAccount] = await Repository.fetchOne({
      tableName: DB_TABLES.ACCOUNT,
      query: {
        integration_id: lead?.Account?.salesforce_account_id,
        company_id,
        integration_type: ACCOUNT_INTEGRATION_TYPES.SALESFORCE_ACCOUNT,
      },
      t,
    });
    if (errForAccount)
      return [null, `Error while finding account: ${errForAccount}`];
    if (!account) {
      [account, errForAccount] = await Repository.create({
        tableName: DB_TABLES.ACCOUNT,
        createObject: {
          name: lead.Account?.[accountSalesforceMap?.name],
          size: lead.Account?.[
            CompanyFieldMapHelper.getCompanySize({
              size: accountSalesforceMap?.size,
            })[0]
          ],
          url: lead.Account?.[accountSalesforceMap?.url] ?? null,
          country: lead.Account?.[accountSalesforceMap?.country],
          zipcode: lead.Account?.[accountSalesforceMap?.zip_code],
          linkedin_url:
            lead.Account?.[accountSalesforceMap?.linkedin_url] ??
            lead.Account.Linkedin_Address__c,
          phone_number: lead.Account?.[accountSalesforceMap?.phone_number],
          salesforce_account_id: lead.Account.salesforce_account_id ?? null,
          integration_status:
            lead.Account?.[accountSalesforceMap?.integration_status?.name],
          user_id: lead.user_id,
          integration_type: ACCOUNT_INTEGRATION_TYPES.SALESFORCE_ACCOUNT,
          integration_id: lead?.Account?.salesforce_account_id,
          company_id,
        },
        t,
      });
    }
    if (errForAccount)
      return [null, `Error while creating account: ${errForAccount}`];

    // // Creating lead
    // console.log('Contact salesforce map => ');
    // console.log(contactSalesforceMap);

    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        type: LEAD_TYPE.HEADER_FORM,
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.[contactSalesforceMap?.first_name],
        last_name: lead?.[contactSalesforceMap?.last_name],
        full_name:
          lead?.[contactSalesforceMap?.first_name] +
          ' ' +
          lead?.[contactSalesforceMap?.last_name],
        linkedin_url: lead?.[contactSalesforceMap?.linkedin_url],
        verified: false,
        source_site: lead?.[contactSalesforceMap?.source_site],
        job_position: lead?.[contactSalesforceMap?.job_position],
        account_id: account.account_id,
        salesforce_contact_id: lead.salesforce_contact_id ?? null,
        duplicate: lead.duplicate,
        user_id: lead.user_id,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT,
        integration_id: lead.salesforce_contact_id,
        company_id,
      },
      t,
    });
    if (errForLead) return [null, `Error while creating lead: ${errForLead}`];

    //Creating lead phone numbers
    const [numberArray, errForArray] = await PhoneNumberHelper.formatForCreate(
      lead.phone_number,
      createdLead.lead_id
    );
    const [_, errForNumbers] = await Repository.bulkCreate({
      tableName: DB_TABLES.LEAD_PHONE_NUMBER,
      createObject: numberArray,
      t,
    });
    if (errForNumbers)
      return [null, `Error while creating lead numbers: ${errForNumbers}`];

    // Creating lead emails
    if (lead.emails) {
      const [emailsArray, errForEmailArray] =
        await LeadEmailHelper.formatForCreate(lead.emails, createdLead.lead_id);

      const [_, errForEmails] = await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_EMAIL,
        createObject: emailsArray,
        t,
      });
      if (errForEmails)
        return [null, `Error while creating lead emails: ${errForEmailArray}`];
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
      return [null, `Error while creating lead to cadence link: ${errForLink}`];

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Contact created successfully: ' + createdLead.lead_id);

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
      return [null, `Error while creating status: ${errForStatus}.`];

    logger.info(`Lead status entry created.`);
    return [{ createdLead, account, createdLink }, null];
  } catch (err) {
    logger.error('Error while creating lead: ', err);
    return [null, err.message];
  }
};

module.exports = createContact;
