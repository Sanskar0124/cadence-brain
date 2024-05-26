// Utils
const logger = require('../../../utils/winston');
const {
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  ACCOUNT_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
} = require('../../../utils/enums');
const { DB_TABLES } = require('../../../utils/modelEnums');

// Repository
const Repository = require('../../../repository');

// Helpers and services
const PhoneNumberHelper = require('../../phone-number');
const LeadEmailHelper = require('../../email');
const CadenceHelper = require('../../cadence');
const TaskHelper = require('../../task');
const importRollback = require('../import_rollback');

const createLeadFromDynamics = async ({ lead, cadence, node, company_id }) => {
  try {
    let createdIds = {};

    let [account, errForAccount] = await Repository.create({
      tableName: DB_TABLES.ACCOUNT,
      createObject: {
        name: lead?.Account?.name,
        size: lead?.Account?.size,
        phone_number: lead?.Account?.phone_number,
        url: lead?.Account?.url ?? null,
        country: lead?.Account?.country,
        integration_type: ACCOUNT_INTEGRATION_TYPES.DYNAMICS_LEAD_ACCOUNT,
        zipcode: lead?.Account?.zipcode,
        user_id: lead.user_id,
        company_id,
      },
    });
    if (errForAccount)
      return [
        null,
        { error: errForAccount, integration_id: lead.integration_id },
      ];

    // * Saving account_id in rollback structure
    createdIds.account_id = account.account_id;

    // Creating lead
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.first_name,
        last_name: lead?.last_name || '',
        full_name: (lead?.first_name || '') + ' ' + (lead?.last_name || ''),
        linkedin_url: lead?.linkedin_url,
        job_position: lead?.job_position,
        account_id: account.account_id,
        user_id: lead.user_id,
        integration_status: lead.integration_status,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD,
        integration_id: lead.Id,
        company_id,
      },
    });
    if (errForLead) {
      importRollback(createdIds);
      return [null, { error: errForLead, integration_id: lead.integration_id }];
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
        // * Return
        return [
          null,
          { error: errForNumbers, integration_id: lead.integration_id },
        ];
      }
    }

    // * Creating lead emails
    if (lead.emails?.length > 0) {
      const [emailsArray, errForEmailArray] =
        await LeadEmailHelper.formatForCreate(lead.emails, createdLead.lead_id);

      const [_, errForEmails] = await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_EMAIL,
        createObject: emailsArray,
        //t,
      });
      if (errForEmails) {
        importRollback(createdIds);
        // * Return
        return [
          null,
          { error: errForEmails, integration_id: lead.integration_id },
        ];
      }
    }

    // Creating lead to cadence link
    const [createdLink, errForLink] = await Repository.create({
      tableName: DB_TABLES.LEADTOCADENCE,
      createObject: {
        lead_id: createdLead.lead_id,
        cadence_id: cadence.cadence_id,
        status:
          createdLead.status === LEAD_STATUS.CONVERTED ||
          createdLead.status === LEAD_STATUS.TRASH
            ? CADENCE_LEAD_STATUS.STOPPED
            : cadence.status === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        lead_cadence_order: lead.leadCadenceOrder,
        unsubscribed: false,
      },
    });
    if (errForLink) {
      importRollback(createdIds);

      // * Return
      return [null, { error: errForLink, integration_id: lead.integration_id }];
    }

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + createdLead.lead_id);

    // * If cadence is in progress, start it.
    if (cadence?.status === CADENCE_STATUS.IN_PROGRESS) {
      if (node) {
        const [taskCreated, errForTaskCreated] =
          await CadenceHelper.launchCadenceForLead(
            createdLead,
            lead.cadence_id,
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
        integration_id: lead.integration_id,
        lead_id: createdLead.lead_id,
      },
      null,
    ];
  } catch (err) {
    logger.error('An error occurred while creating lead', err);
    return [null, { error: err.message, integration_id: lead.integration_id }];
  }
};

module.exports = createLeadFromDynamics;
