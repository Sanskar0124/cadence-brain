// Utils
const logger = require('../../utils/winston');
const {
  LEAD_TYPE,
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Db
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and services
const PhoneNumberHelper = require('../phone-number');
const LeadEmailHelper = require('../email');
const hasLeadUnsubscribed = require('../lead/hasLeadUnsubscribed');
const CadenceHelper = require('../cadence');
const TaskHelper = require('../task');
const importRollback = require('./import_rollback');

const createTempLead = async ({ lead, cadence, node, company_id }) => {
  try {
    let createdIds = {};

    const [account, errForAccount] = await Repository.create({
      tableName: DB_TABLES.ACCOUNT,
      createObject: {
        name: lead.Account.name,
        size: lead.Account.size,
        phone_number: lead.Account.phone_number || null,
        linkedin_url: lead.Account.linkedin_url || null,
        url: lead.Account.url || null,
        country: lead.Account.country,
        integration_type: lead.Account.integration_type,
        zipcode: lead.Account.zipcode,
        user_id: lead.user_id,
        company_id,
      },
    });
    if (errForAccount)
      return [null, { error: errForAccount, preview_id: lead.preview_id }];

    // * Saving account_id in rollback structure
    createdIds.account_id = account.account_id;

    // * Creating lead
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        type: LEAD_TYPE.HEADER_FORM,
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        full_name: lead.first_name || '' + ' ' + lead.last_name || '',
        linkedin_url: lead.linkedin_url,
        verified: false,
        source_site: lead.source_site || null,
        job_position: lead.job_position,
        account_id: account.account_id,
        // salesforce_lead_id: null,
        duplicate: lead.duplicate,
        user_id: lead.user_id,
        integration_status: null,
        assigned_time: new Date(),
        integration_type: lead.integration_type,
        metadata: lead.metadata,
        integration_id: uuidv4(),
        company_id,
      },
    });
    if (errForLead) {
      importRollback(createdIds);
      return [null, { error: errForLead, preview_id: lead.preview_id }];
    }

    // * Saving lead_id in rollback structure
    createdIds.lead_id = createdLead.lead_id;

    // * Creating lead phone numbers
    if (lead.phone_numbers?.length > 0) {
      const [numberArray, errForArray] =
        await PhoneNumberHelper.formatForCreate(
          lead.phone_numbers,
          createdLead.lead_id
        );
      const [_, errForNumbers] = await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_PHONE_NUMBER,
        createObject: numberArray,
      });
      if (errForNumbers) {
        importRollback(createdIds);
        return [null, { error: errForNumbers, preview_id: lead.preview_id }];
      }
    }

    // Creating lead emails
    if (lead.emails?.length > 0) {
      const [emailsArray, errForEmailArray] =
        await LeadEmailHelper.formatForCreate(lead.emails, createdLead.lead_id);

      const [_, errForEmails] = await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_EMAIL,
        createObject: emailsArray,
      });
      if (errForEmails) {
        importRollback(createdIds);
        return [null, { error: errForEmails, preview_id: lead.preview_id }];
      }
    }

    let [unsubscribed, ___] = await hasLeadUnsubscribed(createdLead.lead_id);

    // Creating lead to cadence link
    const [createdLink, errForLink] = await Repository.create({
      tableName: DB_TABLES.LEADTOCADENCE,
      createObject: {
        lead_id: createdLead.lead_id,
        cadence_id: cadence.cadence_id,
        status:
          lead.cadenceStatus === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        lead_cadence_order: lead.leadCadenceOrder,
        unsubscribed: unsubscribed ?? false,
      },
    });
    if (errForLink) {
      importRollback(createdIds);
      return [null, { error: errForLink, preview_id: lead.preview_id }];
    }

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + createdLead.lead_id);

    const [status, errForStatus] = await Repository.create({
      tableName: DB_TABLES.STATUS,
      createObject: {
        lead_id: createdLead.lead_id,
        message: 'Created new lead',
        status: LEAD_STATUS.NEW_LEAD,
      },
    });
    if (errForStatus) {
      importRollback(createdIds);
      return [null, { error: errForStatus, preview_id: lead.preview_id }];
    }

    // * If cadence is in progress, start it.
    if (cadence?.status === CADENCE_STATUS.IN_PROGRESS) {
      if (node) {
        const [taskCreated, errForTaskCreated] =
          await CadenceHelper.launchCadenceForLead(
            createdLead,
            cadence.cadence_id,
            node,
            lead.user_id,
            true
          );
        /*
         * recalculating after each task created,
         * since it is possible that we get many leads at once in this route
         * In that case tasks wont show up if we calculate after every lead is created
         * */
        if (taskCreated)
          TaskHelper.recalculateDailyTasksForUsers([createdLead.user_id]);
      }
    }

    return [
      {
        msg: 'Lead created successfully',
        preview_id: lead.preview_id,
        lead_id: createdLead.lead_id,
      },
      null,
    ];
  } catch (err) {
    logger.error('Error while creating temp lead: ', err);
    return [null, { error: err.message, preview_id: lead.preview_id }];
  }
};

module.exports = createTempLead;
