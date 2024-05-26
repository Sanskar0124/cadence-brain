// Utils
const logger = require('../../utils/winston');
const {
  LEAD_TYPE,
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  ACCOUNT_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repository
const Repository = require('../../repository');

// Helpers and services
const PhoneNumberHelper = require('../phone-number');
const LeadEmailHelper = require('../email');
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');

const createContactCsv = async (lead, company_id, t) => {
  try {
    logger.info('Creating contact..');

    let account, errForAccount;
    if (lead.Account && (!lead.account_id || lead.account_id == null)) {
      // Finding or creating account
      [account, errForAccount] = await Repository.fetchOne({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          integration_id: lead?.Account?.integration_id,
          integration_type: ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY,
          company_id,
        },
        t,
      });
      if (errForAccount)
        return [null, `Error while finding account: ${errForAccount}`];
      if (!account) {
        [account, errForAccount] = await Repository.create({
          tableName: DB_TABLES.ACCOUNT,
          createObject: {
            name: lead?.Account?.name,
            size: lead?.Account?.size,
            url: lead?.Account?.url,
            country: lead?.Account?.country,
            zipcode: lead?.Account?.zipcode,
            linkedin_url: lead?.Account?.linkedin_url,
            user_id: lead.user_id,
            integration_type: ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY,
            integration_id: lead?.Account?.integration_id,
            company_id,
          },
          t,
        });
      }
      if (errForAccount)
        return [null, `Error while creating account: ${errForAccount}`];
    }

    // // Creating lead
    // console.log('Contact hubspot map => ');

    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.first_name,
        last_name: lead?.last_name,
        full_name: lead?.first_name + ' ' + lead?.last_name,
        linkedin_url: lead?.linkedin_url,
        job_position: lead?.job_position,
        account_id: account ? account.account_id : null,
        user_id: lead.user_id,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT,
        integration_id: lead.id,
        company_id,
      },
      t,
    });
    if (errForLead) return [null, `Error while creating lead: ${errForLead}`];

    //Creating lead phone numbers
    if (lead.phone_numbers.length) {
      const [numberArray, errForArray] =
        await PhoneNumberHelper.formatForCreate(
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
    }

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

module.exports = createContactCsv;
