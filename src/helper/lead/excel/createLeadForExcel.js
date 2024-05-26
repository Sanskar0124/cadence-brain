// Utils
const logger = require('../../../utils/winston');
const {
  LEAD_TYPE,
  LEAD_STATUS,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  SALESFORCE_SOBJECTS,
  ACCOUNT_INTEGRATION_TYPES,
  LEAD_INTEGRATION_TYPES,
} = require('../../../utils/enums');
const { DB_TABLES } = require('../../../utils/modelEnums');

// Repository
const Repository = require('../../../repository');

// Helpers and services
const CompanyFieldMapHelper = require('../../company-field-map');
const PhoneNumberHelper = require('../../phone-number');
const LeadEmailHelper = require('../../email');
const SalesforceService = require('../../../services/Salesforce');
const CadenceHelper = require('../../cadence');
const TaskHelper = require('../../task');
const importRollback = require('../import_rollback');

const createdLeadForExcel = async ({ lead, cadence, node, company_id }) => {
  try {
    let createdIds = {};

    // * If account does not exist, Create account...

    let [account, errForAccount] = await Repository.create({
      tableName: DB_TABLES.ACCOUNT,
      createObject: {
        name: lead?.company,
        size: lead?.size,
        phone_number: lead?.company_phone_number,
        url: lead?.url ?? null,
        country: lead?.country,
        integration_type: ACCOUNT_INTEGRATION_TYPES.EXCEL_ACCOUNT,
        zipcode: lead?.zip_code,
        user_id: lead.user_id,
        company_id,
      },
    });
    if (errForAccount)
      return [
        null,
        {
          sr_no: lead.sr_no,
          error: errForAccount,
        },
      ];

    // * Saving account_id in rollback structure
    createdIds.account_id = account.account_id;

    // Creating lead
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        type: LEAD_TYPE.HEADER_FORM,
        status: LEAD_STATUS.NEW_LEAD,
        first_name: lead?.first_name,
        last_name: lead?.last_name || '',
        full_name: `${lead?.first_name || ''} ${lead?.last_name || ''}`,
        linkedin_url: lead?.linkedin_url,
        verified: false,
        source_site: lead?.source_site,
        job_position: lead?.job_position,
        account_id: account.account_id,
        //salesforce_lead_id: lead.Id,
        //duplicate: duplicate ?? false,
        user_id: lead.user_id,
        integration_status: lead.integration_status,
        assigned_time: new Date(),
        integration_type: LEAD_INTEGRATION_TYPES.EXCEL_LEAD,
        company_id,
      },
    });
    if (errForLead) {
      importRollback(createdIds);
      return [
        null,
        {
          error: errForLead,
          sr_no: lead.sr_no,
        },
      ];
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
          {
            error: errForNumbers,
            sr_no: lead.sr_no,
          },
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
          {
            error: errForEmails,
            sr_no: lead.sr_no,
          },
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
          lead.cadenceStatus === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        lead_cadence_order: lead.leadCadenceOrder,
        unsubscribed: false,
      },
    });
    if (errForLink) {
      importRollback(createdIds);

      // * Return
      return [
        null,
        {
          error: errForLink,
          sr_no: lead.sr_no,
        },
      ];
    }

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + createdLead.lead_id);

    // Step: update integration_id and set it to user's integration_id + createdLead.lead_id
    await Repository.update({
      tableName: DB_TABLES.LEAD,
      query: {
        lead_id: createdLead.lead_id,
      },
      updateObject: {
        integration_id: lead.owner_integration_id + createdLead.lead_id,
      },
    });

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
         * In that case tasks wont show up if we calculate in the end after every lead is created
         * */
        if (taskCreated)
          TaskHelper.recalculateDailyTasksForUsers([createdLead.user_id]);
      }
    }

    return [
      {
        sr_no: lead.sr_no,
        msg: 'Lead created successfully',
        lead_cadence_id: createdLead.lead_cadence_id,
        lead_id: createdLead.lead_id,
      },
      null,
    ];
  } catch (err) {
    logger.error('An error occurred while creating lead', err);
    return [
      null,
      {
        error: err.message,
        sr_no: lead.sr_no,
      },
    ];
  }
};

module.exports = createdLeadForExcel;
