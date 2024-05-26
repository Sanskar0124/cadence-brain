// * Util
const logger = require('../../../utils/winston');
const {
  LEAD_TYPE,
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  SALESFORCE_SOBJECTS,
  ACCOUNT_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
  LEAD_IMPORT_SOURCE,
} = require('../../../utils/enums');
const { DB_TABLES } = require('../../../utils/modelEnums');

// * Repository
const Repository = require('../../../repository');

// * Helpers
const PhoneNumberHelper = require('../../phone-number');
const LeadEmailHelper = require('../../email');
const hasLeadUnsubscribed = require('../../lead/hasLeadUnsubscribed');
const CompanyFieldMapHelper = require('../../company-field-map');

const createContactFromHubspot = async ({ lead, company_id }, t) => {
  try {
    logger.info('Creating lead from Hubspot...');
    let account = null,
      errForAccount;
    // * Handle company
    if (lead.Account) {
      // * Check if an account exists using account id
      [account, errForAccount] = await Repository.fetchOne({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          integration_id: lead.Account.integration_id,
          integration_type: ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY,
          company_id,
        },
      });
      if (errForAccount)
        return [null, `Error while finding account: ${errForAccount}`];

      // * Account not found, Create account
      if (!account) {
        [account, errForAccount] = await Repository.create({
          tableName: DB_TABLES.ACCOUNT,
          createObject: {
            name: lead.Account?.name,
            size: lead.Account?.size,
            url: lead.Account?.url ?? null,
            country: lead.Account?.country,
            integration_type: ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY,
            integration_id: lead.Account.integration_id,
            zipcode: lead?.Account?.zipcode,
            user_id: lead.user_id,
            company_id,
          },
          t,
        });
      }
      if (errForAccount)
        return [null, `Error while creating account: ${errForAccount}`];
    }

    // * leadExists flag
    let leadExists = false;

    const [companyFieldMap, errForCompanyFieldMap] =
      await CompanyFieldMapHelper.getFieldMapForCompanyFromUser({
        user_id: lead.user_id,
      });

    let lead_status = LEAD_STATUS.NEW_LEAD;
    if (
      companyFieldMap?.contact_map?.integration_status?.disqualified?.value !==
        undefined && // checking if integration_status is set in field map for disqualified
      companyFieldMap?.contact_map?.integration_status?.disqualified?.value ===
        lead?.integration_status
    )
      lead_status = LEAD_STATUS.TRASH;
    else if (
      companyFieldMap?.contact_map?.integration_status?.converted?.value !==
        undefined && // checking if integration_status is set in field map for converted
      companyFieldMap?.contact_map?.integration_status?.converted?.value ===
        lead?.integration_status
    )
      lead_status = LEAD_STATUS.CONVERTED;

    // * Creating lead
    let [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        type: LEAD_TYPE.HEADER_FORM,
        status: lead_status,
        first_name: lead?.first_name,
        last_name: lead?.last_name || '',
        full_name: lead?.first_name || '' + ' ' + lead?.last_name || '',
        linkedin_url: lead?.linkedin_url,
        verified: false,
        job_position: lead?.job_position,
        account_id: account ? account.account_id : null,
        user_id: lead.user_id,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT,
        metadata: { source: LEAD_IMPORT_SOURCE.ADVANCED_WORKFLOW },
        integration_id: lead.integration_id,
        company_id,
      },
      t,
    });
    if (errForLead) [null, `Error while creating lead: ${errForLead}`];

    // * Creating lead phone numbers
    const [numberArray, errForArray] = await PhoneNumberHelper.formatForCreate(
      lead.phone_numbers,
      createdLead.lead_id
    );
    const [_, errForNumbers] = await Repository.bulkCreate({
      tableName: DB_TABLES.LEAD_PHONE_NUMBER,
      createObject: numberArray,
      t,
    });
    if (errForNumbers)
      return [null, `Error while creating lead numbers: ${errForNumbers}`];

    // * Creating lead emails
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

    // * If link exists, we don't want to create another link
    if (leadExists) {
      let existingLinks = createdLead.LeadToCadences;
      for (let existingLink of existingLinks) {
        if (existingLink.cadence_id === lead.cadence_id) {
          logger.error('Link already exists');
          return [null, `Link already exists`];
        }
      }
    }
    // Creating lead to cadence link
    const [createdLink, errForLink] = await Repository.create({
      tableName: DB_TABLES.LEADTOCADENCE,
      createObject: {
        lead_id: createdLead.lead_id,
        cadence_id: lead.cadence_id,
        status:
          createdLead.status === LEAD_STATUS.CONVERTED ||
          createdLead.status === LEAD_STATUS.TRASH
            ? CADENCE_LEAD_STATUS.STOPPED
            : lead.cadenceStatus === CADENCE_STATUS.IN_PROGRESS
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
      return [null, `Error while creating status: ${errForStatus}.`];

    logger.info(`Lead status entry created.`);
    return [{ createdLead, account, createdLink }, null];
  } catch (err) {
    logger.error(`An error occurred while creating lead from Hubspot: `, err);
    return [null, err.message];
  }
};

module.exports = createContactFromHubspot;
