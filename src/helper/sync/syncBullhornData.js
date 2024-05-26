const logger = require('../../utils/winston');
const {
  LEAD_INTEGRATION_TYPES,
  ACCOUNT_INTEGRATION_TYPES,
  CRM_INTEGRATIONS,
  HIRING_INTEGRATIONS,
  BULLHORN_ENDPOINTS,
  USER_INTEGRATION_TYPES,
  WORKFLOW_TRIGGERS,
  ACTIVITY_TYPE,
  CADENCE_LEAD_STATUS,
  LEAD_STATUS,
  LEAD_SCORE_RUBRIKS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const { LEAD_CADENCE_ORDER_MAX } = require('../../utils/constants');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// Helpers and Services
const ActivityHelper = require('../../helper/activity');
const TaskHelper = require('../../helper/task');
const WorkflowHelper = require('../../helper/workflow');
const CompanyFieldMapHelper = require('../../helper/company-field-map');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const CryptoHelper = require('../../helper/crypto');
const JsonHelper = require('../../helper/json');
const PhoneNumberHelper = require('../../helper/phone-number');
const LeadEmailHelper = require('../../helper/email');
const bullhornService = require('../../services/Bullhorn');
const LeadScoreHelper = require('../../helper/lead-score');

// GRPC
const v2GrpcClients = require('../../grpc/v2');

const updateBullhornContact = async (req, res) => {
  try {
    const {
      contactIds,
      createdContactIds,
      deletedContactIds,
      user_id,
      access_token,
      instance_url,
      company_id,
    } = req;
    if (contactIds.length) {
      let [bullhornMap, errForBullhornMap] =
        await CompanyFieldMapHelper.getFieldMapForCompanyFromUser({
          user_id,
        });
      if (errForBullhornMap) {
        logger.info(`${errForBullhornMap}`);
        return;
      }
      let bullhornContactMap = bullhornMap?.contact_map;
      let bullhornAccountMap = bullhornMap?.account_map;
      if (bullhornContactMap === null || bullhornAccountMap === null) {
        logger.info('Please set bullhorn fields');
        return;
      }
      let first_name = bullhornContactMap.first_name
        ? `${bullhornContactMap.first_name},`
        : '';
      let last_name = bullhornContactMap.last_name
        ? `${bullhornContactMap.last_name},`
        : '';
      let linkedin_url = bullhornContactMap.linkedin_url
        ? `${bullhornContactMap.linkedin_url},`
        : '';
      let source_site = bullhornContactMap.source_site
        ? `${bullhornContactMap.source_site},`
        : '';
      let job_position = bullhornContactMap.job_position
        ? `${bullhornContactMap.job_position},`
        : '';
      let integration_status = bullhornContactMap.integration_status.name
        ? `${bullhornContactMap.integration_status.name},`
        : '';
      let phone_number_query = '';
      bullhornContactMap?.phone_numbers.forEach((phone_type) => {
        if (phone_number_query) phone_number_query += `${phone_type},`;
        else phone_number_query = `${phone_type},`;
      });
      let email_query = '';
      bullhornContactMap?.emails.forEach((email_type) => {
        if (email_query) email_query += `${email_type},`;
        else email_query = `${email_type},`;
      });
      const fields = `id,${first_name}${linkedin_url}${source_site}${job_position}${last_name}${phone_number_query}${email_query}${integration_status}owner,clientCorporation`;
      let account_name = bullhornAccountMap.name
        ? `${bullhornAccountMap.name},`
        : '';
      let account_url = bullhornAccountMap.url
        ? `${bullhornAccountMap.url},`
        : '';
      let account_size = CompanyFieldMapHelper.getCompanySize({
        size: bullhornAccountMap?.size,
      })[0]
        ? `${
            CompanyFieldMapHelper.getCompanySize({
              size: bullhornAccountMap?.size,
            })[0]
          },`
        : '';
      let account_linkedin_url = bullhornAccountMap.linkedin_url
        ? `${bullhornAccountMap.linkedin_url},`
        : '';
      let account_phone_number = bullhornAccountMap.phone_number
        ? `${bullhornAccountMap.phone_number},`
        : '';
      let account_integration_status = bullhornAccountMap.integration_status
        ?.name
        ? `${bullhornAccountMap.integration_status?.name},`
        : '';
      const accountFields = `${account_name}${account_url}${account_size}${account_linkedin_url}${account_phone_number}${account_integration_status}id,address`;
      let flag = true;
      let start = 0,
        count = 100;
      while (flag) {
        let [results, errResult] = await bullhornService.search({
          fields,
          start,
          count: 100,
          object: BULLHORN_ENDPOINTS.CONTACT,
          query: `id: ${contactIds}`,
          access_token,
          instance_url,
        });
        if (errResult) {
          logger.info(`${errResult}`);
          return;
        }
        let contacts = results.data;
        if (contacts.length < 100) flag = false;
        for (let contact of contacts) {
          let contactToUpdate = {};
          const [lead, errForLead] = await Repository.fetchOne({
            tableName: DB_TABLES.LEAD,
            query: {
              integration_type: LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT,
              company_id,
              integration_id: contact.id,
            },
            include: {
              [DB_TABLES.USER]: {
                where: {
                  company_id,
                },
                required: true,
              },
              [DB_TABLES.ACCOUNT]: {},
            },
          });
          if (errForLead) {
            logger.info('Error while finding lead');
            continue;
          }
          if (!lead) {
            logger.info('The lead is not found');
            continue;
          }
          v2GrpcClients.advancedWorkflow.updateBullhornContact({
            integration_data: {
              contact: {
                user_id,
                company_id,
                contact_id: contact.id,
              },
              fetched_lead_id: lead.lead_id,
            },
          });
          if (lead?.User?.integration_id != contact?.owner?.id) {
            const oldOwner = lead.User;
            if (oldOwner === undefined) {
              logger.info('Error while finding old lead owner');
              continue;
            }
            // Fetching new owner
            const [newOwner, errForNewOwner] = await Repository.fetchOne({
              tableName: DB_TABLES.USER,
              query: {
                integration_id: contact?.owner?.id,
                company_id,
                integration_type: USER_INTEGRATION_TYPES.BULLHORN_USER,
              },
            });
            if (errForNewOwner) {
              logger.info('Error while finding new lead owner');
              continue;
            }
            if (!newOwner) {
              logger.info('The new owner does not exist in the cadence tool.');
              await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
                {
                  lead_id: lead.lead_id,
                },
                {
                  status: CADENCE_LEAD_STATUS.STOPPED,
                }
              );

              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.OWNER_CHANGE,
                  variables: {
                    crm: HIRING_INTEGRATIONS.BULLHORN,
                  },
                  activity: {
                    lead_id: lead.lead_id,
                    incoming: null,
                  },
                });
              await ActivityHelper.activityCreation(
                activityFromTemplate,
                lead.user_id
              );
            } else {
              const [workflow, errForWorkflow] =
                await WorkflowHelper.applyWorkflow({
                  trigger: WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
                  lead_id: lead.lead_id,
                  extras: {
                    crm: HIRING_INTEGRATIONS.BULLHORN,
                    integration_id: newOwner.integration_id,
                    new_user_id: newOwner.user_id,
                    oldOwnerSdId: oldOwner.sd_id,
                  },
                });
              if (!errForWorkflow)
                await TaskHelper.skipReplyTaskOwnerChange({
                  lead_id: lead.lead_id,
                  new_user_id: newOwner.user_id,
                  oldOwnerSdId: oldOwner.sd_id,
                });
            }
          }
          if (
            lead?.Account?.integration_id !== contact?.clientCorporation?.id
          ) {
            // * Check if organization exists in database
            let [account, errForAccount] = await Repository.fetchOne({
              tableName: DB_TABLES.ACCOUNT,
              query: {
                integration_id: contact.clientCorporation.id,
                integration_type: ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT,
                company_id,
              },
            });
            if (errForAccount) {
              logger.info(`${errForAccount}`);
              continue;
            }

            // * Account not found, Create account
            if (!account) {
              // * Fetch account from bullhorn
              let [bullhornAccount, errFetchingOrganization] =
                await v2GrpcClients.hiringIntegration.getAccount({
                  integration_type: HIRING_INTEGRATIONS.BULLHORN,
                  integration_data: {
                    corporation_id: contact.clientCorporation.id,
                    access_token,
                    instance_url,
                    fields: accountFields,
                  },
                });

              [account, errForAccount] = await Repository.create({
                tableName: DB_TABLES.ACCOUNT,
                createObject: {
                  name: bullhornAccount[bullhornAccountMap.name],
                  size: bullhornAccount[bullhornAccountMap.size],
                  url: bullhornAccount[bullhornAccountMap.url],
                  country: bullhornAccount?.address?.countryName,
                  linkedin_url:
                    bullhornAccount[bullhornAccountMap.linkedin_url],
                  integration_type: ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT,
                  integration_id: bullhornAccount.id,
                  zipcode: bullhornAccount?.address?.zip,
                  phone_number:
                    bullhornAccount[bullhornAccountMap.phone_number],
                  user_id: lead.user_id,
                  company_id: company_id,
                },
              });
            }

            await Repository.update({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id: lead.lead_id,
              },
              updateObject: {
                account_id: account.account_id,
              },
            });
          }

          for (let key in bullhornContactMap) {
            if (
              !['emails', 'phone_numbers', 'size'].includes(key) &&
              contact[bullhornContactMap[key]] !== lead[key]
            )
              contactToUpdate[key] = contact[bullhornContactMap[key]];
            if (key == 'emails') {
              bullhornContactMap?.emails.forEach((email) => {
                if (contact[email] === null) contact[email] = '';
                LeadEmailHelper.updateEmail(
                  contact[email],
                  email,
                  lead.lead_id
                );
              });
            }
            if (key == 'phone_numbers') {
              bullhornContactMap?.phone_numbers.forEach((phone) => {
                if (contact[phone] === null) contact[phone] = '';
                PhoneNumberHelper.updatePhoneNumber(
                  contact[phone],
                  phone,
                  lead.lead_id
                );
              });
            }
            if (key == 'integration_status') {
              if (
                contact[bullhornContactMap.integration_status.name] !==
                lead.integration_status
              ) {
                // * Check if the lead has been disqualified
                if (
                  contact[bullhornContactMap.integration_status.name] ===
                    bullhornContactMap?.integration_status?.disqualified
                      ?.value &&
                  bullhornContactMap?.integration_status?.disqualified
                    ?.value !== undefined
                ) {
                  logger.info('Lead disqualified from bullhorn');
                  // * Mark lead_status as trash
                  await Repository.update({
                    tableName: DB_TABLES.LEAD,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: LEAD_STATUS.TRASH,
                      integration_status:
                        contact[bullhornContactMap.integration_status.name],
                    },
                  });
                  await Repository.create({
                    tableName: DB_TABLES.STATUS,
                    createObject: {
                      lead_id: lead.lead_id,
                      status: LEAD_STATUS.TRASH,
                    },
                  });

                  // * Stopping all tasks for lead
                  await Repository.update({
                    tableName: DB_TABLES.LEADTOCADENCE,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: CADENCE_LEAD_STATUS.STOPPED,
                    },
                  });

                  //get present date as per timezone
                  const today = new Date().toLocaleDateString('en-GB', {
                    timeZone: lead.User.timezone,
                  });

                  // * Generate acitvity
                  const [activityFromTemplate, errForActivityFromTemplate] =
                    ActivityHelper.getActivityFromTemplates({
                      type: ACTIVITY_TYPE.LEAD_DISQUALIFIED,
                      variables: {
                        today,
                      },
                      activity: {
                        lead_id: lead.lead_id,
                        incoming: null,
                      },
                    });

                  ActivityHelper.activityCreation(
                    activityFromTemplate,
                    lead.user_id
                  );
                  TaskHelper.recalculateDailyTasksForUsers([lead.user_id]);

                  // Reset Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        contact[bullhornContactMap.integration_status.name],
                      previous_status: lead.integration_status,
                      field_map: bullhornContactMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                }
                // * Check if the lead has been converted
                else if (
                  contact[bullhornContactMap?.integration_status?.name] ===
                    bullhornContactMap?.integration_status?.converted?.value &&
                  bullhornContactMap?.integration_status?.converted?.value !==
                    undefined
                ) {
                  // * Update lead status
                  await Repository.update({
                    tableName: DB_TABLES.LEAD,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: LEAD_STATUS.CONVERTED,
                      integration_status:
                        contact[bullhornContactMap?.integration_status?.name],
                    },
                  });

                  await Repository.create({
                    tableName: DB_TABLES.STATUS,
                    createObject: {
                      lead_id: lead.lead_id,
                      status: LEAD_STATUS.CONVERTED,
                    },
                  });

                  await Repository.update({
                    tableName: DB_TABLES.LEADTOCADENCE,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: CADENCE_LEAD_STATUS.STOPPED,
                    },
                  });

                  //get present date as per timezone
                  const today = new Date().toLocaleDateString('en-GB', {
                    timeZone: lead.User.timezone,
                  });

                  const [activityFromTemplate, errForActivityFromTemplate] =
                    ActivityHelper.getActivityFromTemplates({
                      type: ACTIVITY_TYPE.LEAD_CONVERTED,
                      variables: {
                        today,
                      },
                      activity: {
                        lead_id: lead.lead_id,
                        incoming: null,
                      },
                    });

                  ActivityHelper.activityCreation(
                    activityFromTemplate,
                    lead.user_id
                  );
                  TaskHelper.recalculateDailyTasksForUsers([lead.user_id]);

                  // Reset Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        contact[bullhornContactMap?.integration_status?.name],
                      previous_status: lead.integration_status,
                      field_map: bullhornContactMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                } else {
                  // Update Lead Integration Status
                  let [updatedLead, errForUpdatedLead] =
                    await Repository.update({
                      tableName: DB_TABLES.LEAD,
                      query: { lead_id: lead.lead_id },
                      updateObject: {
                        integration_status:
                          contact[bullhornContactMap?.integration_status?.name],
                      },
                    });

                  if (errForUpdatedLead) {
                    logger.error(
                      'Error while updating lead integration status',
                      errForUpdatedLead
                    );
                  }

                  // Update Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        contact[bullhornContactMap?.integration_status?.name],
                      previous_status: lead.integration_status,
                      field_map: bullhornContactMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                }
              }
            }
          }
          if (Object.keys(contactToUpdate).length > 0) {
            contactToUpdate.full_name = `${
              contact[bullhornContactMap?.first_name]
            } ${contact[bullhornContactMap?.last_name]}`;
            const [updatedLead, errForUpdatedLead] = await Repository.update({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id: lead.lead_id,
              },
              updateObject: contactToUpdate,
            });
            if (errForUpdatedLead) {
              logger.info(`${errForUpdatedLead}`);
              continue;
            }
          }
        }
        start += 100;
      }

      logger.info('Successfully updated bullhorn contact.');
    }
    if (createdContactIds.length) {
      for (let createdContact of createdContactIds) {
        let contact = {
          user_id,
          company_id,
          contact_id: createdContact,
        };
        v2GrpcClients.advancedWorkflow.addBullhornContact({
          integration_data: {
            contact,
          },
        });
      }
    }
    if (deletedContactIds.length) {
      for (let lead_id of deletedContactIds) {
        const [fetchedLead, errForLead] = await Repository.fetchOne({
          tableName: DB_TABLES.LEAD,
          query: {
            integration_id: lead_id,
            integration_type: LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT,
          },
          include: {
            [DB_TABLES.USER]: {
              where: { company_id: company_id },
              required: true,
            },
            [DB_TABLES.ACCOUNT]: {
              attributes: ['account_id'],
            },
          },
        });
        if (errForLead) continue;
        if (!fetchedLead) continue;

        const [deletedLead, errForDeletedLead] = await deleteAllLeadInfo({
          leadIds: [fetchedLead.lead_id],
          accountIds: [fetchedLead?.Account?.account_id],
        });
      }
    }
  } catch (err) {
    logger.error(`Error while syncing contact in bullhorn: ${err}`);
  }
};
const updateBullhornLead = async (req, res) => {
  try {
    const {
      leadIds,
      createdLeadIds,
      deletedLeadIds,
      user_id,
      access_token,
      instance_url,
      company_id,
    } = req;
    if (leadIds.length) {
      let [bullhornMap, errForBullhornMap] =
        await CompanyFieldMapHelper.getFieldMapForCompanyFromUser({
          user_id,
        });
      if (errForBullhornMap) {
        logger.info(`${errForBullhornMap}`);
        return;
      }
      let bullhornLeadMap = bullhornMap?.lead_map;
      let bullhornAccountMap = bullhornMap?.account_map;

      if (bullhornLeadMap === null) {
        logger.info('Please set bullhorn fields');
        return;
      }
      // * Construct query for lead
      let first_name = bullhornLeadMap.first_name
        ? `${bullhornLeadMap.first_name},`
        : '';
      let last_name = bullhornLeadMap.last_name
        ? `${bullhornLeadMap.last_name},`
        : '';
      let linkedin_url = bullhornLeadMap.linkedin_url
        ? `${bullhornLeadMap.linkedin_url},`
        : '';
      let source_site = bullhornLeadMap.source_site
        ? `${bullhornLeadMap.source_site},`
        : '';
      let job_position = bullhornLeadMap.job_position
        ? `${bullhornLeadMap.job_position},`
        : '';
      let integration_status = bullhornLeadMap.integration_status.name
        ? `${bullhornLeadMap.integration_status.name},`
        : '';

      let phone_number_query = '';
      bullhornLeadMap?.phone_numbers.forEach((phone_type) => {
        if (phone_number_query) phone_number_query += `${phone_type},`;
        else phone_number_query = `${phone_type},`;
      });
      let email_query = '';
      bullhornLeadMap?.emails.forEach((email_type) => {
        if (email_query) email_query += `${email_type},`;
        else email_query = `${email_type},`;
      });

      let account_name = bullhornAccountMap.name
        ? `${bullhornAccountMap.name},`
        : '';
      let account_url = bullhornAccountMap.url
        ? `${bullhornAccountMap.url},`
        : '';
      let account_size = CompanyFieldMapHelper.getCompanySize({
        size: bullhornAccountMap?.size,
      })[0]
        ? `${
            CompanyFieldMapHelper.getCompanySize({
              size: bullhornAccountMap?.size,
            })[0]
          },`
        : '';
      let account_linkedin_url = bullhornAccountMap.linkedin_url
        ? `${bullhornAccountMap.linkedin_url},`
        : '';
      let account_phone_number = bullhornAccountMap.phone_number
        ? `${bullhornAccountMap.phone_number},`
        : '';
      let account_integration_status = bullhornAccountMap.integration_status
        ?.name
        ? `${bullhornAccountMap.integration_status?.name},`
        : '';
      const accountFields = `${account_name}${account_url}${account_size}${account_linkedin_url}${account_phone_number}${account_integration_status}id,address`;
      const fields = `id,${first_name}${linkedin_url}${phone_number_query}${email_query}${source_site}${job_position}${last_name}${integration_status}owner,clientCorporation`;
      let flag = true;
      let start = 0;
      while (flag) {
        let [results, errResult] = await bullhornService.search({
          fields,
          start,
          count: 100,
          object: BULLHORN_ENDPOINTS.LEAD,
          query: `id: ${leadIds}`,
          access_token,
          instance_url,
        });
        if (errResult) {
          logger.info(`${errResult}`);
          return;
        }
        let leads = results.data;
        if (leads.length < 100) flag = false;
        for (let bullhornLead of leads) {
          let leadToUpdate = {};
          const [lead, errForLead] = await Repository.fetchOne({
            tableName: DB_TABLES.LEAD,
            query: {
              integration_type: LEAD_INTEGRATION_TYPES.BULLHORN_LEAD,
              company_id,
              integration_id: bullhornLead.id,
            },
            include: {
              [DB_TABLES.USER]: {
                where: {
                  company_id,
                },
                required: true,
              },
              [DB_TABLES.ACCOUNT]: {},
            },
          });
          if (errForLead) {
            logger.info('Error while finding lead');
            continue;
          }
          if (!lead) {
            logger.info('The lead is not found');
            continue;
          }
          v2GrpcClients.advancedWorkflow.updateBullhornLead({
            integration_data: {
              lead: {
                user_id,
                company_id,
                lead_id: bullhornLead.id,
              },
              fetched_lead_id: lead.lead_id,
            },
          });
          if (lead?.User?.integration_id != bullhornLead?.owner?.id) {
            const oldOwner = lead.User;
            if (oldOwner === undefined) {
              logger.info('Error while finding old lead owner');
              continue;
            }

            // Fetching new owner
            const [newOwner, errForNewOwner] = await Repository.fetchOne({
              tableName: DB_TABLES.USER,
              query: {
                integration_id: bullhornLead?.owner?.id,
                company_id,
                integration_type: USER_INTEGRATION_TYPES.BULLHORN_USER,
              },
            });
            if (errForNewOwner) {
              logger.info('Error while finding new lead owner');
              continue;
            }
            if (!newOwner) {
              logger.info('The new owner does not exist in the cadence tool.');
              await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
                {
                  lead_id: lead.lead_id,
                },
                {
                  status: CADENCE_LEAD_STATUS.STOPPED,
                }
              );

              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.OWNER_CHANGE,
                  variables: {
                    crm: HIRING_INTEGRATIONS.BULLHORN,
                  },
                  activity: {
                    lead_id: lead.lead_id,
                    incoming: null,
                  },
                });
              await ActivityHelper.activityCreation(
                activityFromTemplate,
                lead.user_id
              );
            } else {
              const [workflow, errForWorkflow] =
                await WorkflowHelper.applyWorkflow({
                  trigger: WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
                  lead_id: lead.lead_id,
                  extras: {
                    crm: HIRING_INTEGRATIONS.BULLHORN,
                    integration_id: newOwner.integration_id,
                    new_user_id: newOwner.user_id,
                    oldOwnerSdId: oldOwner.sd_id,
                  },
                });
              if (!errForWorkflow)
                await TaskHelper.skipReplyTaskOwnerChange({
                  lead_id: lead.lead_id,
                  new_user_id: newOwner.user_id,
                  oldOwnerSdId: oldOwner.sd_id,
                });
            }
          }
          if (
            (!lead.account_id && bullhornLead?.clientCorporation?.id) ||
            (lead.account_id &&
              bullhornLead?.clientCorporation?.id &&
              lead?.Account.integration_id !==
                bullhornLead?.clientCorporation?.id)
          ) {
            logger.info('Account has been linked with the person');

            // * Check if organization exists in database
            let [account, errForAccount] = await Repository.fetchOne({
              tableName: DB_TABLES.ACCOUNT,
              query: {
                integration_id: bullhornLead?.clientCorporation?.id,
                integration_type: ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT,
                company_id,
              },
            });
            if (errForAccount) {
              logger.info(`${errForAccount}`);
              continue;
            }

            // * Account not found, Create account
            // * Account not found, Create account
            if (!account) {
              // * Fetch account from bullhorn
              let [bullhornAccount, errFetchingOrganization] =
                await v2GrpcClients.hiringIntegration.getAccount({
                  integration_type: HIRING_INTEGRATIONS.BULLHORN,
                  integration_data: {
                    corporation_id: bullhornLead?.clientCorporation?.id,
                    access_token,
                    instance_url,
                    fields: accountFields,
                  },
                });

              [account, errForAccount] = await Repository.create({
                tableName: DB_TABLES.ACCOUNT,
                createObject: {
                  name: bullhornAccount[bullhornAccountMap.name],
                  size: bullhornAccount[bullhornAccountMap.size],
                  url: bullhornAccount[bullhornAccountMap.url],
                  country: bullhornAccount?.address?.countryName,
                  linkedin_url:
                    bullhornAccount[bullhornAccountMap.linkedin_url],
                  integration_type: ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT,
                  integration_id: bullhornAccount.id,
                  zipcode: bullhornAccount?.address?.zip,
                  phone_number:
                    bullhornAccount[bullhornAccountMap.phone_number],
                  user_id: lead.user_id,
                  company_id: company_id,
                },
              });
            }

            await Repository.update({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id: lead.lead_id,
              },
              updateObject: {
                account_id: account.account_id,
              },
            });
          }
          if (lead.account_id && !bullhornLead?.clientCorporation?.id) {
            logger.info('Lead has been unlinked with an account');
            await Repository.update({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id: lead.lead_id,
              },
              updateObject: {
                account_id: null,
              },
              // t,
            });
          }
          for (let key in bullhornLeadMap) {
            if (
              !['emails', 'phone_numbers'].includes(key) &&
              bullhornLead[bullhornLeadMap[key]] !== lead[key]
            )
              leadToUpdate[key] = bullhornLead[bullhornLeadMap[key]];
            if (key == 'emails') {
              bullhornLeadMap?.emails.forEach((email) => {
                if (bullhornLead[email] === null) bullhornLead[email] = '';
                LeadEmailHelper.updateEmail(
                  bullhornLead[email],
                  email,
                  lead.lead_id
                );
              });
            }
            if (key == 'phone_numbers') {
              bullhornLeadMap?.phone_numbers.forEach((phone) => {
                if (bullhornLead[phone] === null) bullhornLead[phone] = '';
                PhoneNumberHelper.updatePhoneNumber(
                  bullhornLead[phone],
                  phone,
                  lead.lead_id
                );
              });
            }
            if (key == 'integration_status') {
              if (
                bullhornLead[bullhornLeadMap.integration_status.name] !==
                lead.integration_status
              ) {
                // * Check if the lead has been disqualified
                if (
                  bullhornLead[bullhornLeadMap.integration_status.name] ===
                    bullhornLeadMap?.integration_status?.disqualified?.value &&
                  bullhornLeadMap?.integration_status?.disqualified?.value !==
                    undefined
                ) {
                  logger.info('Lead disqualified from bullhorn');
                  // * Mark lead_status as trash
                  await Repository.update({
                    tableName: DB_TABLES.LEAD,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: LEAD_STATUS.TRASH,
                      integration_status:
                        bullhornLead[bullhornLeadMap.integration_status.name],
                    },
                  });
                  await Repository.create({
                    tableName: DB_TABLES.STATUS,
                    createObject: {
                      lead_id: lead.lead_id,
                      status: LEAD_STATUS.TRASH,
                    },
                  });

                  // * Stopping all tasks for lead
                  await Repository.update({
                    tableName: DB_TABLES.LEADTOCADENCE,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: CADENCE_LEAD_STATUS.STOPPED,
                    },
                  });

                  //get present date as per timezone
                  const today = new Date().toLocaleDateString('en-GB', {
                    timeZone: lead.User.timezone,
                  });

                  // * Generate acitvity
                  const [activityFromTemplate, errForActivityFromTemplate] =
                    ActivityHelper.getActivityFromTemplates({
                      type: ACTIVITY_TYPE.LEAD_DISQUALIFIED,
                      variables: {
                        today,
                      },
                      activity: {
                        lead_id: lead.lead_id,
                        incoming: null,
                      },
                    });

                  ActivityHelper.activityCreation(
                    activityFromTemplate,
                    lead.user_id
                  );
                  TaskHelper.recalculateDailyTasksForUsers([lead.user_id]);

                  // Reset Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        bullhornLead[bullhornLeadMap.integration_status.name],
                      previous_status: lead.integration_status,
                      field_map: bullhornLeadMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                }
                // * Check if the lead has been converted
                else if (
                  bullhornLead[bullhornLeadMap?.integration_status?.name] ===
                    bullhornLeadMap?.integration_status?.converted?.value &&
                  bullhornLeadMap?.integration_status?.converted?.value !==
                    undefined
                ) {
                  // * Update lead status
                  await Repository.update({
                    tableName: DB_TABLES.LEAD,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: LEAD_STATUS.CONVERTED,
                      integration_status:
                        bullhornLead[bullhornLeadMap?.integration_status?.name],
                    },
                  });

                  await Repository.create({
                    tableName: DB_TABLES.STATUS,
                    createObject: {
                      lead_id: lead.lead_id,
                      status: LEAD_STATUS.CONVERTED,
                    },
                  });

                  await Repository.update({
                    tableName: DB_TABLES.LEADTOCADENCE,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: CADENCE_LEAD_STATUS.STOPPED,
                    },
                  });

                  //get present date as per timezone
                  const today = new Date().toLocaleDateString('en-GB', {
                    timeZone: lead.User.timezone,
                  });

                  const [activityFromTemplate, errForActivityFromTemplate] =
                    ActivityHelper.getActivityFromTemplates({
                      type: ACTIVITY_TYPE.LEAD_CONVERTED,
                      variables: {
                        today,
                      },
                      activity: {
                        lead_id: lead.lead_id,
                        incoming: null,
                      },
                    });

                  ActivityHelper.activityCreation(
                    activityFromTemplate,
                    lead.user_id
                  );
                  TaskHelper.recalculateDailyTasksForUsers([lead.user_id]);

                  // Reset Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        bullhornLead[bullhornLeadMap?.integration_status?.name],
                      previous_status: lead.integration_status,
                      field_map: bullhornLeadMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                } else {
                  // Update Lead Integration Status
                  let [updatedLead, errForUpdatedLead] =
                    await Repository.update({
                      tableName: DB_TABLES.LEAD,
                      query: { lead_id: lead.lead_id },
                      updateObject: {
                        integration_status:
                          bullhornLead[
                            bullhornLeadMap?.integration_status?.name
                          ],
                      },
                    });

                  if (errForUpdatedLead) {
                    logger.error(
                      'Error while updating lead integration status',
                      errForUpdatedLead
                    );
                  }

                  // Update Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        bullhornLead[bullhornLeadMap?.integration_status?.name],
                      previous_status: lead.integration_status,
                      field_map: bullhornLeadMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                }
              }
            }
          }

          if (Object.keys(leadToUpdate).length > 0) {
            leadToUpdate.full_name = `${
              bullhornLead[bullhornLeadMap?.first_name]
            } ${bullhornLead[bullhornLeadMap?.last_name]}`;
            const [updatedLead, errForUpdatedLead] = await Repository.update({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id: lead.lead_id,
              },
              updateObject: leadToUpdate,
            });
            if (errForUpdatedLead) {
              logger.info(`${errForUpdatedLead}`);
              continue;
            }
          }
        }
        start += 100;
      }
      logger.info('Successfully updated bullhorn lead.');
    }
    if (createdLeadIds.length) {
      for (let createdLead of createdLeadIds) {
        let lead = {
          user_id,
          company_id,
          lead_id: createdLead,
        };
        v2GrpcClients.advancedWorkflow.addBullhornLead({
          integration_data: {
            lead,
          },
        });
      }
    }
    if (deletedLeadIds.length) {
      for (let lead_id of deletedLeadIds) {
        const [fetchedLead, errForLead] = await Repository.fetchOne({
          tableName: DB_TABLES.LEAD,
          query: {
            integration_id: lead_id,
            integration_type: LEAD_INTEGRATION_TYPES.BULLHORN_LEAD,
          },
          include: {
            [DB_TABLES.USER]: {
              where: { company_id: company_id },
              required: true,
            },
            [DB_TABLES.ACCOUNT]: {
              attributes: ['account_id'],
            },
          },
        });
        if (errForLead) continue;
        if (!fetchedLead) continue;

        const [deletedLead, errForDeletedLead] = await deleteAllLeadInfo({
          leadIds: [fetchedLead.lead_id],
          accountIds: [fetchedLead?.Account?.account_id],
        });
      }
    }
  } catch (err) {
    logger.error(`Error while syncing lead in bullhorn: ${err}`);
  }
};
const updateBullhornCandidate = async (req, res) => {
  try {
    const {
      candidateIds,
      createdCandidateIds,
      deletedCandidateIds,
      user_id,
      access_token,
      instance_url,
      company_id,
    } = req;
    if (candidateIds.length) {
      let [bullhornMap, errForBullhornMap] =
        await CompanyFieldMapHelper.getFieldMapForCompanyFromUser({
          user_id,
        });
      if (errForBullhornMap) {
        logger.info(`${errForBullhornMap}`);
        return;
      }
      let bullhornCandidateMap = bullhornMap?.candidate_map;
      if (bullhornCandidateMap === null) {
        logger.info('Please set bullhorn fields');
        return;
      }
      let first_name = bullhornCandidateMap.first_name
        ? `${bullhornCandidateMap.first_name},`
        : '';
      let last_name = bullhornCandidateMap.last_name
        ? `${bullhornCandidateMap.last_name},`
        : '';
      let linkedin_url = bullhornCandidateMap.linkedin_url
        ? `${bullhornCandidateMap.linkedin_url},`
        : '';
      let source_site = bullhornCandidateMap.source_site
        ? `${bullhornCandidateMap.source_site},`
        : '';
      let job_position = bullhornCandidateMap.job_position
        ? `${bullhornCandidateMap.job_position},`
        : '';

      let company = bullhornCandidateMap.company
        ? `${bullhornCandidateMap.company},`
        : '';

      let size = CompanyFieldMapHelper.getCompanySize({
        size: bullhornCandidateMap?.size,
      })[0]
        ? `${
            CompanyFieldMapHelper.getCompanySize({
              size: bullhornCandidateMap?.size,
            })[0]
          },`
        : '';
      let integration_status = bullhornCandidateMap.integration_status.name
        ? `${bullhornCandidateMap.integration_status.name},`
        : '';
      let url = bullhornCandidateMap.url ? `${bullhornCandidateMap.url},` : '';

      let phone_number_query = '';
      bullhornCandidateMap?.phone_numbers.forEach((phone_type) => {
        if (phone_number_query) phone_number_query += `${phone_type},`;
        else phone_number_query = `${phone_type},`;
      });
      let email_query = '';
      bullhornCandidateMap?.emails.forEach((email_type) => {
        if (email_query) email_query += `${email_type},`;
        else email_query = `${email_type},`;
      });

      const fields = `id,${first_name}${company}${linkedin_url}${phone_number_query}${email_query}${size}${url}${source_site}${job_position}${last_name}${integration_status}owner,address`;
      let flag = true;
      let start = 0;
      while (flag) {
        // * Construct query for lead
        let [results, errResult] = await bullhornService.search({
          fields,
          start,
          count: 100,
          object: BULLHORN_ENDPOINTS.CANDIDATE,
          query: `id: ${candidateIds}`,
          access_token,
          instance_url,
        });
        if (errResult) {
          logger.info(`${errResult}`);
          return;
        }
        let candidates = results.data;
        if (candidates.length < 100) flag = false;
        for (let bullhornCandidate of candidates) {
          let candidateToUpdate = {};
          const [lead, errForLead] = await Repository.fetchOne({
            tableName: DB_TABLES.LEAD,
            query: {
              integration_type: LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE,
              company_id,
              integration_id: bullhornCandidate.id,
            },
            include: {
              [DB_TABLES.USER]: {
                where: {
                  company_id,
                },
                required: true,
              },
              [DB_TABLES.ACCOUNT]: {},
            },
          });
          if (errForLead) {
            logger.info('Error while finding lead');
            continue;
          }
          let candidate = {
            user_id,
            company_id,
            candidate_id: bullhornCandidate.id,
          };
          if (!lead) {
            logger.info('The lead is not found');
            continue;
          }
          v2GrpcClients.advancedWorkflow.updateBullhornCandidate({
            integration_data: {
              candidate,
              fetched_lead_id: lead.lead_id,
            },
          });
          if (lead?.User?.integration_id != bullhornCandidate?.owner?.id) {
            const oldOwner = lead.User;
            if (oldOwner === undefined) {
              logger.info('Error while finding old lead owner');
              continue;
            }

            // Fetching new owner
            const [newOwner, errForNewOwner] = await Repository.fetchOne({
              tableName: DB_TABLES.USER,
              query: {
                integration_id: bullhornCandidate?.owner?.id,
                company_id,
                integration_type: USER_INTEGRATION_TYPES.BULLHORN_USER,
              },
            });
            if (errForNewOwner) {
              logger.info('Error while finding new lead owner');
              continue;
            }
            if (!newOwner) {
              logger.info('The new owner does not exist in the cadence tool.');
              await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
                {
                  lead_id: lead.lead_id,
                },
                {
                  status: CADENCE_LEAD_STATUS.STOPPED,
                }
              );

              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.OWNER_CHANGE,
                  variables: {
                    crm: HIRING_INTEGRATIONS.BULLHORN,
                  },
                  activity: {
                    lead_id: lead.lead_id,
                    incoming: null,
                  },
                });
              await ActivityHelper.activityCreation(
                activityFromTemplate,
                lead.user_id
              );
            } else {
              const [workflow, errForWorkflow] =
                await WorkflowHelper.applyWorkflow({
                  trigger: WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
                  lead_id: lead.lead_id,
                  extras: {
                    crm: HIRING_INTEGRATIONS.BULLHORN,
                    integration_id: newOwner.integration_id,
                    new_user_id: newOwner.user_id,
                    oldOwnerSdId: oldOwner.sd_id,
                  },
                });
              if (!errForWorkflow)
                await TaskHelper.skipReplyTaskOwnerChange({
                  lead_id: lead.lead_id,
                  new_user_id: newOwner.user_id,
                  oldOwnerSdId: oldOwner.sd_id,
                });
            }
          }
          bullhornCandidate[bullhornCandidateMap.country] =
            bullhornCandidate?.address?.countryName;
          bullhornCandidate[bullhornCandidateMap.zip_code] =
            bullhornCandidate?.address?.zip;
          for (let key in bullhornCandidateMap) {
            if (
              !['emails', 'phone_numbers'].includes(key) &&
              bullhornCandidate[bullhornCandidateMap[key]] !== lead[key]
            )
              candidateToUpdate[key] =
                bullhornCandidate[bullhornCandidateMap[key]];
            if (key == 'emails') {
              bullhornCandidateMap?.emails.forEach((email) => {
                if (bullhornCandidate[email] === null)
                  bullhornCandidate[email] = '';
                LeadEmailHelper.updateEmail(
                  bullhornCandidate[email],
                  email,
                  lead.lead_id
                );
              });
            }
            if (key == 'phone_numbers') {
              bullhornCandidateMap?.phone_numbers.forEach((phone) => {
                if (bullhornCandidate[phone] === null)
                  bullhornCandidate[phone] = '';
                PhoneNumberHelper.updatePhoneNumber(
                  bullhornCandidate[phone],
                  phone,
                  lead.lead_id
                );
              });
            }
            if (key == 'integration_status') {
              if (
                bullhornCandidate[
                  bullhornCandidateMap.integration_status.name
                ] !== lead.integration_status
              ) {
                // * Check if the lead has been disqualified
                if (
                  bullhornCandidate[
                    bullhornCandidateMap.integration_status.name
                  ] ===
                    bullhornCandidateMap?.integration_status?.disqualified
                      ?.value &&
                  bullhornCandidateMap?.integration_status?.disqualified
                    ?.value !== undefined
                ) {
                  logger.info('Lead disqualified from bullhorn');
                  // * Mark lead_status as trash
                  await Repository.update({
                    tableName: DB_TABLES.LEAD,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: LEAD_STATUS.TRASH,
                      integration_status:
                        bullhornCandidate[
                          bullhornCandidateMap.integration_status.name
                        ],
                    },
                  });
                  await Repository.create({
                    tableName: DB_TABLES.STATUS,
                    createObject: {
                      lead_id: lead.lead_id,
                      status: LEAD_STATUS.TRASH,
                    },
                  });

                  // * Stopping all tasks for lead
                  await Repository.update({
                    tableName: DB_TABLES.LEADTOCADENCE,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: CADENCE_LEAD_STATUS.STOPPED,
                    },
                  });

                  //get present date as per timezone
                  const today = new Date().toLocaleDateString('en-GB', {
                    timeZone: lead.User.timezone,
                  });

                  // * Generate acitvity
                  const [activityFromTemplate, errForActivityFromTemplate] =
                    ActivityHelper.getActivityFromTemplates({
                      type: ACTIVITY_TYPE.LEAD_DISQUALIFIED,
                      variables: {
                        today,
                      },
                      activity: {
                        lead_id: lead.lead_id,
                        incoming: null,
                      },
                    });

                  ActivityHelper.activityCreation(
                    activityFromTemplate,
                    lead.user_id
                  );
                  TaskHelper.recalculateDailyTasksForUsers([lead.user_id]);

                  // Reset Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        bullhornCandidate[
                          bullhornCandidateMap.integration_status.name
                        ],
                      previous_status: lead.integration_status,
                      field_map: bullhornCandidateMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                }
                // * Check if the lead has been converted
                else if (
                  bullhornCandidate[
                    bullhornCandidateMap?.integration_status?.name
                  ] ===
                    bullhornCandidateMap?.integration_status?.converted
                      ?.value &&
                  bullhornCandidateMap?.integration_status?.converted?.value !==
                    undefined
                ) {
                  // * Update lead status
                  await Repository.update({
                    tableName: DB_TABLES.LEAD,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: LEAD_STATUS.CONVERTED,
                      integration_status:
                        bullhornCandidate[
                          bullhornCandidateMap?.integration_status?.name
                        ],
                    },
                  });

                  await Repository.create({
                    tableName: DB_TABLES.STATUS,
                    createObject: {
                      lead_id: lead.lead_id,
                      status: LEAD_STATUS.CONVERTED,
                    },
                  });

                  await Repository.update({
                    tableName: DB_TABLES.LEADTOCADENCE,
                    query: { lead_id: lead.lead_id },
                    updateObject: {
                      status: CADENCE_LEAD_STATUS.STOPPED,
                    },
                  });

                  //get present date as per timezone
                  const today = new Date().toLocaleDateString('en-GB', {
                    timeZone: lead.User.timezone,
                  });

                  const [activityFromTemplate, errForActivityFromTemplate] =
                    ActivityHelper.getActivityFromTemplates({
                      type: ACTIVITY_TYPE.LEAD_CONVERTED,
                      variables: {
                        today,
                      },
                      activity: {
                        lead_id: lead.lead_id,
                        incoming: null,
                      },
                    });

                  ActivityHelper.activityCreation(
                    activityFromTemplate,
                    lead.user_id
                  );
                  TaskHelper.recalculateDailyTasksForUsers([lead.user_id]);

                  // Reset Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        bullhornCandidate[
                          bullhornCandidateMap?.integration_status?.name
                        ],
                      previous_status: lead.integration_status,
                      field_map: bullhornCandidateMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                } else {
                  // Update Lead Integration Status
                  let [updatedLead, errForUpdatedLead] =
                    await Repository.update({
                      tableName: DB_TABLES.LEAD,
                      query: { lead_id: lead.lead_id },
                      updateObject: {
                        integration_status:
                          bullhornCandidate[
                            bullhornCandidateMap?.integration_status?.name
                          ],
                      },
                    });

                  if (errForUpdatedLead) {
                    logger.error(
                      'Error while updating lead integration status',
                      errForUpdatedLead
                    );
                  }

                  // Update Lead Score
                  let [updatedLeadScore, errForUpdatedLeadScore] =
                    await LeadScoreHelper.updateLeadScore({
                      lead: lead,
                      rubrik: LEAD_SCORE_RUBRIKS.STATUS_UPDATE,
                      current_status:
                        bullhornCandidate[
                          bullhornCandidateMap?.integration_status?.name
                        ],
                      previous_status: lead.integration_status,
                      field_map: bullhornCandidateMap,
                    });
                  if (errForUpdatedLeadScore)
                    logger.error(
                      'An error occured while updating lead score',
                      errForUpdatedLeadScore
                    );
                }
              }
            }
          }
          if (
            lead.account_id &&
            bullhornCandidate[bullhornCandidateMap?.company]
          ) {
            let accountObject = {
              name: bullhornCandidate?.[bullhornCandidateMap?.company],
              size:
                bullhornCandidate?.[
                  CompanyFieldMapHelper.getCompanySize({
                    size: bullhornCandidateMap?.size,
                  })[0]
                ] ?? null,
              url: bullhornCandidate?.[bullhornCandidateMap?.url] ?? null,
              country:
                bullhornCandidate?.[bullhornCandidateMap?.country] ?? null,
              zipcode:
                bullhornCandidate?.[bullhornCandidateMap?.zip_code] ?? null,
            };
            accountObject = JsonHelper.clean(accountObject);
            if (Object.keys(accountObject).length)
              await Repository.update({
                tableName: DB_TABLES.ACCOUNT,
                query: { account_id: lead.account_id },
                updateObject: accountObject,
              });
          } else if (
            !lead.account_id &&
            bullhornCandidate[bullhornCandidateMap?.company]
          ) {
            [account, errForAccount] = await Repository.create({
              tableName: DB_TABLES.ACCOUNT,
              createObject: {
                name: bullhornCandidate[bullhornCandidateMap?.company],
                size:
                  bullhornCandidate?.[
                    CompanyFieldMapHelper.getCompanySize({
                      size: bullhornCandidateMap?.size,
                    })[0]
                  ] ?? null,
                url: bullhornCandidate[bullhornCandidateMap.url],
                country: bullhornCandidate[bullhornCandidateMap?.country],
                integration_type:
                  ACCOUNT_INTEGRATION_TYPES.BULLHORN_CANDIDATE_ACCOUNT,
                zipcode:
                  bullhornCandidate?.[bullhornCandidateMap?.zip_code] ?? null,
                phone_number:
                  bullhornCandidate[bullhornCandidateMap?.phone_number],
                user_id: lead.user_id,
                company_id: company_id,
              },
            });
            candidateToUpdate.account_id = account ? account.account_id : null;
          } else {
            await Repository.destroy({
              tableName: DB_TABLES.ACCOUNT,
              query: {
                account_id: lead.account_id,
              },
            });
            candidateToUpdate.account_id = null;
          }

          if (Object.keys(candidateToUpdate).length > 0) {
            candidateToUpdate.full_name = `${
              bullhornCandidate[bullhornCandidateMap?.first_name]
            } ${bullhornCandidate[bullhornCandidateMap?.last_name]}`;
            const [updatedLead, errForUpdatedLead] = await Repository.update({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id: lead.lead_id,
              },
              updateObject: candidateToUpdate,
            });
            if (errForUpdatedLead) {
              logger.info(`${errForUpdatedLead}`);
              continue;
            }
          }
        }
        start += 100;
      }
      logger.info('Successfully updated bullhorn candidate.');
    }
    if (createdCandidateIds.length) {
      for (let createdCandidate of createdCandidateIds) {
        let candidate = {
          user_id,
          company_id,
          candidate_id: createdCandidate,
        };
        v2GrpcClients.advancedWorkflow.addBullhornCandidate({
          integration_data: {
            candidate,
          },
        });
      }
    }
    if (deletedCandidateIds.length) {
      for (let lead_id of deletedCandidateIds) {
        const [fetchedLead, errForLead] = await Repository.fetchOne({
          tableName: DB_TABLES.LEAD,
          query: {
            integration_id: lead_id,
            integration_type: LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE,
          },
          include: {
            [DB_TABLES.USER]: {
              where: { company_id: company_id },
              required: true,
            },
            [DB_TABLES.ACCOUNT]: {
              attributes: ['account_id'],
            },
          },
        });
        if (errForLead) continue;
        if (!fetchedLead) continue;

        const [deletedLead, errForDeletedLead] = await deleteAllLeadInfo({
          leadIds: [fetchedLead.lead_id],
          accountIds: [fetchedLead?.Account?.account_id],
        });
      }
    }
  } catch (err) {
    logger.error(`Error while syncing candidate in bullhorn: ${err}`);
  }
};
const updateBullhornAccount = async (req, res) => {
  try {
    const {
      corporationIds,
      createdCorporationIds,
      deletedCorporationIds,
      user_id,
      access_token,
      instance_url,
      company_id,
    } = req;
    if (corporationIds.length) {
      let [bullhornMap, errForBullhornMap] =
        await CompanyFieldMapHelper.getFieldMapForCompanyFromUser({
          user_id,
        });
      if (errForBullhornMap) {
        logger.info(`${errForBullhornMap}`);
        return;
      }
      let bullhornAccountMap = bullhornMap?.account_map;
      if (bullhornAccountMap === null) {
        logger.info('Please set bullhorn fields');
        return;
      }
      let account_name = bullhornAccountMap.name
        ? `${bullhornAccountMap.name},`
        : '';
      let account_url = bullhornAccountMap.url
        ? `${bullhornAccountMap.url},`
        : '';
      let account_size = CompanyFieldMapHelper.getCompanySize({
        size: bullhornAccountMap?.size,
      })[0]
        ? `${
            CompanyFieldMapHelper.getCompanySize({
              size: bullhornAccountMap?.size,
            })[0]
          },`
        : '';
      let account_linkedin_url = bullhornAccountMap.linkedin_url
        ? `${bullhornAccountMap.linkedin_url},`
        : '';
      let account_phone_number = bullhornAccountMap.phone_number
        ? `${bullhornAccountMap.phone_number},`
        : '';
      let account_integration_status = bullhornAccountMap.integration_status
        ?.name
        ? `${bullhornAccountMap.integration_status?.name},`
        : '';
      const fields = `${account_name}${account_url}${account_size}${account_linkedin_url}${account_phone_number}${account_integration_status}id,address`;
      let flag = true;
      let start = 0;
      while (flag) {
        let [results, errResult] = await bullhornService.search({
          fields,
          start,
          count: 100,
          object: BULLHORN_ENDPOINTS.CORPORATION,
          query: `id: ${corporationIds}`,
          access_token,
          instance_url,
        });
        if (errResult) {
          logger.info(`${errResult}`);
          return;
        }
        let corporations = results.data;
        if (corporations.length < 100) flag = false;

        for (let bullhornAccount of corporations) {
          let accountToUpdate = {};
          const [account, errForAccount] = await Repository.fetchOne({
            tableName: DB_TABLES.ACCOUNT,
            query: {
              integration_type: ACCOUNT_INTEGRATION_TYPES.BULLHORN_ACCOUNT,
              company_id,
              integration_id: bullhornAccount.id,
            },
          });
          if (errForAccount) {
            logger.info('Error while finding lead');
            continue;
          }
          if (!account) {
            logger.info('The account is not found');
            continue;
          }
          bullhornAccount[bullhornAccountMap.country] =
            bullhornAccount?.address?.countryName;
          bullhornAccount[bullhornAccountMap.zip_code] =
            bullhornAccount?.address?.zip;

          for (let key in bullhornAccountMap) {
            if (
              !['emails', 'phone_numbers', 'size'].includes(key) &&
              bullhornAccount[bullhornAccountMap[key]] !== account[key]
            )
              accountToUpdate[key] = bullhornAccount[bullhornAccountMap[key]];
            if ('size' === key) {
              accountToUpdate[key] =
                bullhornAccount[
                  CompanyFieldMapHelper.getCompanySize({
                    size: bullhornAccountMap?.size,
                  })[0]
                ];
            }
            if (key == 'integration_status')
              accountToUpdate[key] =
                bullhornAccount[bullhornAccountMap?.integration_status?.name];
          }
          accountToUpdate.zipcode = zipcode;
          if (Object.keys(accountToUpdate).length > 0) {
            const [updatedAccount, errForUpdatedAccount] =
              await Repository.update({
                tableName: DB_TABLES.ACCOUNT,
                query: {
                  account_id: account.account_id,
                },
                updateObject: accountToUpdate,
              });
            if (errForUpdatedAccount) {
              logger.info(`${errForUpdatedAccount}`);
              continue;
            }
          }
        }
        start += 100;
      }

      logger.info('Successfully updated bullhorn account.');
    }
  } catch (err) {
    logger.error(`Error while updating bullhorn account: ${err} `);
  }
};

const BullhornController = {
  updateBullhornContact,
  updateBullhornLead,
  updateBullhornCandidate,
  updateBullhornAccount,
};
module.exports = BullhornController;
