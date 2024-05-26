// Utils
const logger = require('../../utils/winston');
const {
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
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

const createContact = async (lead, company_id, t) => {
  try {
    logger.info('Creating contact..');

    let account, errForAccount;
    // Finding or creating account
    if (lead.account) {
      [account, errForAccount] = await Repository.fetchOne({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          name: lead.account.name,
          integration_id: lead?.account?.integration_id,
          integration_type: ACCOUNT_INTEGRATION_TYPES.SELLSY_COMPANY,
          company_id,
        },
        t,
      });
      if (errForAccount)
        return [null, { error: errForAccount, sr_no: lead.sr_no }];

      if (!account) {
        [account, errForAccount] = await Repository.create({
          tableName: DB_TABLES.ACCOUNT,
          createObject: {
            name: lead?.account?.name,
            size: lead?.account?.size,
            url: lead?.account?.url,
            user_id: lead.user_id,
            integration_type: ACCOUNT_INTEGRATION_TYPES.SELLSY_COMPANY,
            integration_id: lead?.account?.integration_id,
            company_id,
          },
          t,
        });
      }
      if (errForAccount)
        return [null, { error: errForAccount, sr_no: lead.sr_no }];
    }
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.first_name,
        last_name: lead?.last_name,
        full_name: lead?.first_name + ' ' + lead?.last_name,
        linkedin_url: lead?.linkedin_url,
        job_position: lead?.job_position,
        account_id: account?.account_id ?? null,
        user_id: lead.user_id,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.SELLSY_CONTACT,
        integration_id: lead.integration_id,
        company_id,
      },
      t,
    });
    if (errForLead) return [null, { error: errForLead, sr_no: lead.sr_no }];

    //Creating lead phone numbers
    if (lead.phone_numbers?.length > 0) {
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
        return [null, { error: errForNumbers, sr_no: lead.sr_no }];
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
        return [null, { error: errForEmailArray, sr_no: lead.sr_no }];
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
    if (errForLink) return [null, { error: errForLink, sr_no: lead.sr_no }];

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
    if (errForStatus) return [null, { error: errForStatus, sr_no: lead.sr_no }];

    logger.info(`Lead status entry created.`);
    return [{ createdLead, account, createdLink, sr_no: lead.sr_no }, null];
  } catch (err) {
    logger.error('Error while creating lead: ', err);
    return [null, { error: err.message, sr_no: lead.sr_no }];
  }
};

module.exports = createContact;
