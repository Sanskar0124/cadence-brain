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
const CadenceHelper = require('../../cadence');
const TaskHelper = require('../../task');
const importRollback = require('../import_rollback');

const createContactFromHubspotCSV = async ({
  lead,
  cadence,
  node,
  company_id,
  access_token,
  instance_url,
  companyFieldMap,
}) => {
  try {
    let createdIds = {};

    // * Check if account exists in database
    let account, errForAccount, errForAccountFetch;
    if (lead.Account && (!lead.account_id || lead.account_id == null)) {
      [account, errForAccount] = await Repository.fetchOne({
        tableName: DB_TABLES.ACCOUNT,
        query: {
          integration_id: lead?.Account?.integration_id,
          company_id,
          integration_type: ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY,
        },
      });
      if (errForAccount) {
        if (errForAccount.includes('WHERE'))
          return [
            null,
            {
              error: 'Unable to find account in Hubspot. Check column mapping',
              integration_id: lead.id,
            },
          ];

        return [null, { error: errForAccount, integration_id: lead.id }];
      }

      // * If account does not exist, Create account...
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
            phone_number: lead?.Account?.phone_number,
            company_id,
          },
        });
        if (errForAccount) {
          if (errForAccount.includes('must be unique')) {
            [account, errForAccountFetch] = await Repository.fetchOne({
              tableName: DB_TABLES.ACCOUNT,
              query: {
                integration_id: lead?.Account?.integration_id,
                company_id,
                integration_type: ACCOUNT_INTEGRATION_TYPES.HUBSPOT_COMPANY,
              },
            });
            if (errForAccountFetch) {
              logger.error(`Error fetching account: ${errForAccountFetch}`);
              return [
                null,
                {
                  error: errForAccountFetch,
                  integration_id: lead.id,
                },
              ];
            }
          } else {
            logger.error(`Error creating account: ${errForAccount}`);
            return [null, { error: errForAccount, integration_id: lead.id }];
          }
        }

        // * Saving account_id in rollback structure
        createdIds.account_id = account.account_id;
      }
    }

    let lead_status = LEAD_STATUS.NEW_LEAD;
    if (
      companyFieldMap?.contact_map?.integration_status?.disqualified?.value !==
        undefined && // checking if integration_status is set in field map for disqualified
      companyFieldMap?.contact_map?.integration_status?.disqualified?.label ===
        lead?.integration_status
    )
      lead_status = LEAD_STATUS.TRASH;
    else if (
      companyFieldMap?.contact_map?.integration_status?.converted?.value !==
        undefined && // checking if integration_status is set in field map for converted
      companyFieldMap?.contact_map?.integration_status?.converted?.label ===
        lead?.integration_status
    )
      lead_status = LEAD_STATUS.CONVERTED;

    // Creating lead
    const [createdLead, errForLead] = await Repository.create({
      tableName: DB_TABLES.LEAD,
      createObject: {
        status: lead_status,
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
    });
    if (errForLead) {
      importRollback(createdIds);
      return [null, { error: errForLead, integration_id: lead.id }];
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
        return [null, { error: errForNumbers, integration_id: lead.id }];
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
        return [null, { error: errForEmails, integration_id: lead.id }];
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
      return [null, { error: errForLink, integration_id: lead.id }];
    }

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + createdLead.lead_id);

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
        integration_id: lead.id,
        lead_id: createdLead.lead_id,
      },
      null,
    ];
  } catch (err) {
    logger.error('An error occurred while creating lead', err);
    return [null, { error: err.message, integration_id: lead.id }];
  }
};

module.exports = createContactFromHubspotCSV;
