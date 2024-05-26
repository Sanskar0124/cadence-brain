// * Util
const logger = require('../../../utils/winston');
const {
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  ACCOUNT_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
} = require('../../../utils/enums');
const { DB_TABLES } = require('../../../utils/modelEnums');

// * Repository
const Repository = require('../../../repository');

// * Helpers
const PhoneNumberHelper = require('../../phone-number');
const LeadEmailHelper = require('../../email');
const hasLeadUnsubscribed = require('../hasLeadUnsubscribed');
const importRollback = require('../import_rollback');
const CadenceHelper = require('../../cadence');
const TaskHelper = require('../../task');

const createContactFromSellsy = async ({ lead, cadence, node, company_id }) => {
  try {
    logger.info('Creating lead from Sellsy...');

    let createdIds = {};

    let account = null,
      errForAccount;
    // * Handle organization
    if (lead?.account?.integration_id) {
      // * Check if an account exists using organization id
      [account, errForAccount] = await Repository.fetchOne({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          integration_id: lead.account.integration_id,
          integration_type: ACCOUNT_INTEGRATION_TYPES.SELLSY_COMPANY,
          company_id,
        },
      });

      // * Account not found, Create account
      if (!account) {
        [account, errForAccount] = await Repository.create({
          tableName: DB_TABLES.ACCOUNT,
          createObject: {
            name: lead.account?.name,
            size: lead.account?.size,
            url: lead.account?.url ?? null,
            integration_type: ACCOUNT_INTEGRATION_TYPES.SELLSY_COMPANY,
            integration_id: lead.account.integration_id,
            phone_number: lead.account?.phone_number,
            user_id: lead.user_id,
            company_id,
          },
        });

        // * Saving account_id in rollback structure
        createdIds.account_id = account?.account_id;
      }
      if (errForAccount)
        return [null, { error: errForAccount, sr_no: lead.sr_no }];
    }

    // * Creating lead
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.first_name,
        last_name: lead?.last_name || '',
        full_name: (lead?.first_name || '') + ' ' + (lead?.last_name || ''),
        linkedin_url: lead?.linkedin_url,
        job_position: lead?.job_position,
        account_id: account ? account.account_id : null,
        user_id: lead.user_id,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.SELLSY_CONTACT,
        integration_id: lead.integration_id,
        company_id,
      },
    });
    if (errForLead) {
      importRollback(createdIds);
      return [null, { error: errForLead, sr_no: lead.sr_no }];
    }

    // * Saving lead_id in rollback structure
    createdIds.lead_id = createdLead.lead_id;

    // * Creating lead phone numbers
    if (lead.phone_numbers?.length) {
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

        // * Return
        return [null, { error: errForNumbers, sr_no: lead.sr_no }];
      }
    }

    // * Creating lead emails
    if (lead.emails?.length) {
      const [emailsArray, errForEmailArray] =
        await LeadEmailHelper.formatForCreate(lead.emails, createdLead.lead_id);

      const [_, errForEmails] = await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_EMAIL,
        createObject: emailsArray,
      });
      if (errForEmails) {
        importRollback(createdIds);
        // * Return
        return [null, { error: errForEmails, sr_no: lead.sr_no }];
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
      // * Return
      return [null, { error: errForLink, sr_no: lead.sr_no }];
    }

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Contact created successfully: ' + createdLead.lead_id);

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

      // * Return
      return [null, { error: errForStatus, sr_no: lead.sr_no }];
    }

    logger.info(`Lead status entry created.`);
    return [
      {
        msg: 'Lead created successfully',
        integration_id: lead.Id,
        lead_id: createdLead.lead_id,
        sr_no: lead.sr_no,
      },
      null,
    ];
  } catch (err) {
    logger.error(`An error occurred while creating lead from sellsy: `, err);
    return [null, { error: err.message, sr_no: lead.sr_no }];
  }
};

module.exports = createContactFromSellsy;
