// Utils
const logger = require('../../utils/winston');
const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');
const {
  COMPANY_CONTACT_REASSIGNMENT_OPTIONS,
  CRM_INTEGRATIONS,
  USER_INTEGRATION_TYPES,
  WORKFLOW_TRIGGERS,
  ACTIVITY_TYPE,
} = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const SalesforceService = require('../../services/Salesforce');
const GoogleSheets = require('../../services/Google/Google-Sheets');
const WorkflowHelper = require('../workflow');
const ActivityHelper = require('../activity');

// GRPC
const v2GrpcClients = require('../../grpc/v2');

const reassignLeads = async ({
  leads,
  contacts,
  access_token,
  instance_url,
  contact_reassignment_rule,
  reassignTasksForLeads,
  reassignTasksForContacts,
  reassignToForLeads,
  reassignToForContacts,
  integration_type = CRM_INTEGRATIONS.SALESFORCE,
}) => {
  /*
   * All updates in our tool is commented, since it will be handled by webhooks of owner change for lead,contact and account.
   * Hence transaction is also not used.
   *
   * */
  //const t = await sequelize.transaction();
  try {
    logger.info('Reassignment started.');

    // re-assign to other user
    let i = 0;
    // * store previous user count to get range for next user
    let previousUserCount = 0;

    let leadsForUser = [];
    let accountsForUser = [];

    let googleSheetsFieldMap;
    if (integration_type === CRM_INTEGRATIONS.GOOGLE_SHEETS) {
      let [userForFieldMap, errFetchingUser] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: {
          user_id: reassignToForLeads?.[0]?.user_id,
        },
        extras: {
          attributes: ['first_name'],
        },
        include: {
          [DB_TABLES.COMPANY]: {
            attributes: ['name'],
            [DB_TABLES.COMPANY_SETTINGS]: {
              [DB_TABLES.GOOGLE_SHEETS_FIELD_MAP]: {},
            },
          },
        },
      });
      if (errFetchingUser || !userForFieldMap)
        return [null, 'Please ask admin to create field map'];
      googleSheetsFieldMap =
        userForFieldMap?.Company?.Company_Setting?.Google_Sheets_Field_Map
          ?.lead_map;
    }

    // reassignment for leads
    // reassign in sf
    // if successful, reassign leads and task in our db
    if (integration_type !== CRM_INTEGRATIONS.SELLSY) {
      for (let reassignToData of reassignToForLeads) {
        const [reassignToUser, errForReassignToUser] =
          await Repository.fetchOne({
            tableName: DB_TABLES.USER,
            query: {
              user_id: reassignToData?.user_id,
            },
          });
        if (errForReassignToUser) {
          logger.error(`Could not reassign for ${reassignToData?.user_id}`);
          i++;
          continue;
        }
        if (!reassignToUser) {
          logger.error(`Could not find user: ${reassignToData?.user_id}`);
          i++;
          continue;
        }

        if (i === 0) {
          leadsForUser = leads.slice(0, reassignToData?.count);
        } else if (i === reassignToForLeads?.length) {
          leadsForUser = leads.slice(
            reassignToData?.count,
            reassignToForLeads?.length
          );
        } else {
          leadsForUser = leads.slice(
            previousUserCount,
            previousUserCount + reassignToData?.count
          );
        }

        //update previousUserCount
        previousUserCount += reassignToData?.count;
        let updatedLeads, errForUpdatedLeads;

        switch (integration_type) {
          case CRM_INTEGRATIONS.SALESFORCE:
            [updatedLeads, errForUpdatedLeads] =
              await SalesforceService.bulkUpdateLeadOwner(
                leadsForUser,
                reassignToUser.salesforce_owner_id,
                access_token,
                instance_url
              );
            if (updatedLeads?.length)
              logger.info(`Successfully updated leads in salesforce.`);
            break;
          case CRM_INTEGRATIONS.GOOGLE_SHEETS:
            if (
              reassignToUser.integration_type !==
              USER_INTEGRATION_TYPES.GOOGLE_SHEETS_USER
            )
              continue;

            let [_, errForReassignment] =
              await GoogleSheets.reassignLeadsForGoogleSheets({
                leadsForUser,
                reassignToUser,
                googleSheetsFieldMap,
              });
            if (errForReassignment) return [null, errForReassignment];
            break;
          case CRM_INTEGRATIONS.DYNAMICS:
            [updatedLeads, errForUpdatedLeads] =
              await v2GrpcClients.crmIntegration.bulkUpdateLeadOwners({
                integration_type: CRM_INTEGRATIONS.DYNAMICS,
                integration_data: {
                  leads: leadsForUser,
                  ownerId: reassignToUser.integration_id,
                  access_token,
                  instance_url,
                },
              });
            if (updatedLeads?.length)
              logger.info(
                `Successfully updated ${updatedLeads?.length} leads owner in dynamics.`
              );
            break;
          default:
            break;
        }

        i++;
      }
    }

    let contactsForUser = [];
    accountsForUser = [];
    previousUserCount = 0;
    i = 0; // re-initialiaze

    // reassignment for contacts
    for (let reassignToData of reassignToForContacts) {
      const [reassignToUser, errForReassignToUser] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: {
          user_id: reassignToData?.user_id,
        },
        //t,
      });
      if (errForReassignToUser) {
        logger.error(`Could not reassign for ${reassignToData?.user_id}`);
        i++;
        continue;
      }
      if (!reassignToUser) {
        logger.error(`Could not find user: ${reassignToData?.user_id}`);
        i++;
        continue;
      }

      if (i === 0) {
        contactsForUser = contacts.slice(0, reassignToData?.count);
      } else if (i === reassignToForContacts?.length) {
        contactsForUser = contacts.slice(
          reassignToData?.count,
          reassignToForContacts?.length
        );
      } else {
        contactsForUser = contacts.slice(
          previousUserCount,
          previousUserCount + reassignToData?.count
        );
      }

      //console.log(
      //previousUserCount,
      //leadsForUser,
      //accountsForUser,
      //reassignToData?.user_id
      //);
      //
      //update previousUserCount
      previousUserCount += reassignToData?.count;

      let data = '',
        err = '';

      let updatedContacts = '',
        errForUpdatedContacts = '';

      let updatedAccounts = '',
        errForUpdatedAccounts = '';

      // if true, then update accounts as well
      if (
        [
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_AND_ACCOUNT,
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS,
        ].includes(contact_reassignment_rule)
      ) {
        switch (integration_type) {
          case CRM_INTEGRATIONS.SALESFORCE:
            accountsForUser = contactsForUser.map(
              (contact) => contact?.Account
            );

            [updatedAccounts, errForUpdatedAccounts] =
              await SalesforceService.bulkUpdateAccountOwner(
                accountsForUser,
                reassignToUser.salesforce_owner_id,
                access_token,
                instance_url
              );

            //let updatedAccounts = accountsForUser.map(
            //(account) => account.account_id
            //);

            // if updated from sf, update in our db
            if (updatedAccounts?.length) {
              logger.info(`Successfully updated accounts in salesforce.`);

              //logger.info(
              //`Successfully updated accounts in salesforce, now updating in our db.`
              //);
              //[data, err] = await Repository.update({
              //tableName: DB_TABLES.ACCOUNT,
              //query: {
              //account_id: {
              //[Op.in]: updatedAccounts,
              //},
              //},
              //updateObject: {
              //user_id: reassignToData?.user_id,
              //},
              //t,
              //});
            }

            // if true, update other contacts of accounts as well
            if (
              contact_reassignment_rule ===
              COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS
            ) {
              const [accountContacts, errForAccountContacts] =
                await Repository.fetchAll({
                  tableName: DB_TABLES.LEAD,
                  query: {
                    account_id: {
                      [Op.in]: updatedAccounts,
                    },
                    salesforce_contact_id: {
                      [Op.ne]: null,
                    },
                  },
                  //t,
                });

              if (errForAccountContacts) {
                logger.error(
                  `Error while fetching account contacts: ${errForAccountContacts}.`
                );
                i++;
                continue;
              }

              [updatedContacts, errForUpdatedContacts] =
                await SalesforceService.bulkUpdateContactOwner(
                  accountContacts,
                  reassignToUser?.salesforce_owner_id,
                  access_token,
                  instance_url
                );

              //updatedContacts = accountContacts.map((contact) => contact.lead_id);

              if (updatedContacts?.length) {
                logger.info(
                  `Successfully updated contacts in salesforce, now updating in our db.`
                );
                //logger.info(
                //`Successfully updated contacts in salesforce, now updating in our db.`
                //);
                //[data, err] = await Repository.update({
                //tableName: DB_TABLES.LEAD,
                //query: {
                //lead_id: {
                //[Op.in]: updatedContacts,
                //},
                //},
                //updateObject: {
                //user_id: reassignToData?.user_id,
                //},
                //t,
                //});
              }
            }

            break;
          case CRM_INTEGRATIONS.SELLSY:
            accountsForUser = contactsForUser
              .filter((contact) => contact?.Account?.integration_id != null)
              .map((contact) => contact.Account);

            if (accountsForUser?.length) {
              [updatedAccounts, errForUpdatedAccounts] =
                await v2GrpcClients.crmIntegration.bulkUpdateAccountOwners({
                  integration_type: CRM_INTEGRATIONS.SELLSY,
                  integration_data: {
                    accounts: accountsForUser,
                    ownerId: parseInt(reassignToUser.integration_id),
                    access_token,
                  },
                });
              if (updatedAccounts?.length)
                logger.info(`Successfully updated accounts owner in sellsy.`);
            }

            if (
              contact_reassignment_rule ===
              COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS
            ) {
              let accountContacts, errForAccountContacts;
              if (accountsForUser?.length) {
                [accountContacts, errForAccountContacts] =
                  await Repository.fetchAll({
                    tableName: DB_TABLES.LEAD,
                    query: {
                      account_id: {
                        [Op.in]: updatedAccounts,
                      },
                      integration_id: {
                        [Op.ne]: null,
                      },
                    },
                  });
                if (errForAccountContacts) {
                  logger.error(errForAccountContacts);
                  i++;
                  continue;
                }
              }

              if (!accountsForUser?.length)
                accountContacts = [...contactsForUser];

              [updatedContacts, errForUpdatedContacts] =
                await v2GrpcClients.crmIntegration.bulkUpdateContactOwners({
                  integration_type: CRM_INTEGRATIONS.SELLSY,
                  integration_data: {
                    contacts: accountContacts,
                    ownerId: parseInt(reassignToUser.integration_id),
                    access_token,
                  },
                });
              if (updatedContacts?.length)
                logger.info(
                  `Successfully updated contacts in sellsy, now updating in our db.`
                );
            }
            break;
          case CRM_INTEGRATIONS.DYNAMICS:
            accountsForUser = [];
            const integrationIds = new Set();

            for (const contact of contactsForUser) {
              const account = contact?.Account;
              if (
                account?.integration_id != null &&
                !integrationIds.has(account.integration_id)
              ) {
                integrationIds.add(account.integration_id);
                accountsForUser.push(account);
              }
            }

            if (
              accountsForUser?.length &&
              contact_reassignment_rule ===
                COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS
            ) {
              [updatedAccounts, errForUpdatedAccounts] =
                await v2GrpcClients.crmIntegration.bulkUpdateAccountOwners({
                  integration_type: CRM_INTEGRATIONS.DYNAMICS,
                  integration_data: {
                    accounts: accountsForUser,
                    ownerId: reassignToUser.integration_id,
                    access_token,
                    instance_url,
                  },
                });
              if (updatedAccounts?.length)
                logger.info(
                  `Successfully updated ${updatedAccounts?.length} accounts owner in dynamics.`
                );
            }
            break;
          default:
            break;
        }
      }

      // if true, then update contact
      if (
        [
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ONLY,
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_AND_ACCOUNT,
        ].includes(contact_reassignment_rule)
      ) {
        let tempContactsForUser = [...contactsForUser]; // make copy

        switch (integration_type) {
          case CRM_INTEGRATIONS.SALESFORCE:
            [updatedContacts, errForUpdatedContacts] =
              await SalesforceService.bulkUpdateContactOwner(
                tempContactsForUser,
                reassignToUser.salesforce_owner_id,
                access_token,
                instance_url
              );

            //updatedContacts = contactsForUser.map((contact) => contact.lead_id);

            if (updatedContacts?.length) {
              logger.info(`Successfully updated contacts in salesforce.`);
              //logger.info(
              //`Successfully updated contacts in salesforce, now updating in our db.`
              //);
              //[data, err] = await Repository.update({
              //tableName: DB_TABLES.LEAD,
              //query: {
              //lead_id: {
              //[Op.in]: updatedContacts,
              //},
              //},
              //updateObject: {
              //user_id: reassignToData?.user_id,
              //},
              //t,
              //});
            }

            break;
          case CRM_INTEGRATIONS.SELLSY:
            [updatedContacts, errForUpdatedContacts] =
              await v2GrpcClients.crmIntegration.bulkUpdateContactOwners({
                integration_type: CRM_INTEGRATIONS.SELLSY,
                integration_data: {
                  contacts: tempContactsForUser,
                  ownerId: parseInt(reassignToUser.integration_id),
                  access_token,
                },
              });
            if (updatedContacts?.length)
              logger.info(`Successfully updated contacts owner in sellsy.`);
            break;
          case CRM_INTEGRATIONS.DYNAMICS:
            if (
              contact_reassignment_rule ===
              COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ONLY
            ) {
              [updatedContacts, errForUpdatedContacts] =
                await v2GrpcClients.crmIntegration.bulkUpdateContactOwners({
                  integration_type: CRM_INTEGRATIONS.DYNAMICS,
                  integration_data: {
                    contacts: tempContactsForUser,
                    ownerId: reassignToUser.integration_id,
                    access_token,
                    instance_url,
                  },
                });
              if (updatedContacts?.length)
                logger.info(
                  `Successfully updated ${updatedContacts?.length} contact's owner in dynamics.`
                );
            }
            break;
          default:
            break;
        }
      }

      //if (reassignTasksForContacts) {
      //[data, err] = await Repository.update({
      //tableName: DB_TABLES.TASK,
      //query: {
      //lead_id: {
      //[Op.in]: updatedContacts,
      //},
      //},
      //updateObject: {
      //user_id: reassignToData?.user_id,
      //},
      //t,
      //});
      //}

      i++;
    }

    //t.commit();
    logger.info(`Reassignment successful.`);
    return ['Reassignment Successful.', null];
  } catch (err) {
    //t.rollback();
    logger.error(`Error while reassigning leads: `, err);
    return [null, err.message];
  }
};

module.exports = reassignLeads;
