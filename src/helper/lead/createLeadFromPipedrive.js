// * Util
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

// * Repository
const Repository = require('../../repository');

// * Helpers
const PhoneNumberHelper = require('../phone-number');
const LeadEmailHelper = require('../email');
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');

const createLeadFromPipedrive = async ({ lead, company_id }, t) => {
  try {
    logger.info('Creating lead from Pipedrive...');

    let account = null,
      errForAccount;
    // * Handle organization
    if (lead.Account) {
      // * Check if an account exists using organization id
      [account, errForAccount] = await Repository.fetchOne({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          integration_id: lead.Account.Id,
          integration_type: ACCOUNT_INTEGRATION_TYPES.PIPEDRIVE_ORGANIZATION,
        },
        include: {
          [DB_TABLES.USER]: {
            where: { company_id },
            required: true,
          },
        },
        t,
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
            integration_type: ACCOUNT_INTEGRATION_TYPES.PIPEDRIVE_ORGANIZATION,
            integration_id: lead.Account.Id,
            zipcode: lead?.Account?.zip_code,
            phone_number: lead.Account?.phone_number,
            user_id: lead.user_id,
            company_id,
          },
          t,
        });
      }
      if (errForAccount)
        return [null, `Error while creating account: ${errForAccount}`];
    }

    // * Checking if lead exists
    let [leadExists, errCheckingIfLeadExists] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: {
        integration_id: lead.Id,
        integration_type: LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON,
        company_id,
      },
      t,
    });
    if (errCheckingIfLeadExists) return [null, errCheckingIfLeadExists];
    if (leadExists) return [null, 'Lead is already present in tool'];

    // * Creating lead
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        type: LEAD_TYPE.HEADER_FORM,
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.first_name,
        last_name: lead?.last_name || '',
        full_name: lead?.first_name || '' + ' ' + lead?.last_name || '',
        linkedin_url: lead?.linkedin_url,
        verified: false,
        job_position: lead?.job_position,
        account_id: account ? account.account_id : null,
        user_id: lead.user_id,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON,
        integration_id: lead.Id,
        company_id,
      },
      t,
    });
    if (errForLead) return [null, `Error while creating lead: ${errForLead}`];

    // * Creating lead phone numbers
    if (lead.phone_number?.length) {
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
        return [null, `Error while creating lead numbers: ${errForNumbers}`];
    }

    // * Creating lead emails
    if (lead.emails?.length) {
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
    logger.error(`An error occurred while creating lead from Pipedrive: `, err);
    return [null, err.message];
  }
};

module.exports = {
  createLeadFromPipedrive,
};
