// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  USER_ROLE,
  COMPANY_CONTACT_REASSIGNMENT_OPTIONS,
  LEAD_INTEGRATION_TYPES,
  CRM_INTEGRATIONS,
} = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// Helpers and services
const SalesforceService = require('../../services/Salesforce');
const AccessTokenHelper = require('../../helper/access-token');

// GRPC
const v2GrpcClients = require('../../grpc/v2');

/**
 * @param {Object} lead - lead whose owner needs to be updated
 * @param {Sequelize.UUID} toUserId - user_id for user to which ownership needs to be changed
 */
const changeOwner = async (lead, toUserId) => {
  let accountTransaction = '';
  let leadTransaction = '';

  try {
    const [toUser, errForToUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id: toUserId },
      include: {
        [DB_TABLES.COMPANY]: {
          attributes: ['company_id', 'integration_type'],
          [DB_TABLES.COMPANY_SETTINGS]: {
            attributes: ['contact_reassignment_rule', 'user_id'],
          },
        },
      },
      extras: { attributes: ['integration_id'] },
    });
    if (errForToUser) return [null, errForToUser];
    if (!toUser) {
      logger.error(
        `No user found with user_id: ${toUserId} for ownership change.`
      );
      return [
        null,
        `No user found with user_id: ${toUserId} for ownership change.`,
      ];
    }

    const contact_reassignment_rule =
      toUser?.Company.Company_Setting.contact_reassignment_rule;

    let [administrator, errForAdministrator] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id: toUser?.Company?.Company_Setting?.user_id }, // administrator
      extras: { attributes: ['user_id'] },
      include: {
        [DB_TABLES.COMPANY]: {
          where: {
            company_id: toUser.Company.company_id,
          },
          attributes: ['name'],
          required: true,
        },
      },
    });
    if (errForAdministrator)
      return serverErrorResponse(
        res,
        'Since Adminstrator not found, cannot change ownership.'
      );
    if (!administrator)
      return notFoundResponse(
        res,
        'Since Adminstrator not found, cannot change ownership.'
      );

    // const [admin, errForAdmin] = await Repository.fetchOne({
    //   tableName: DB_TABLES.USER,
    //   query: { role: USER_ROLE.ADMIN },
    //   extras: { attributes: ['user_id'] },
    // });
    // if (errForAdmin) return [null, errForAdmin];
    // if (!admin) {
    //   logger.error(`Since Admin not found, cannot change ownership.`);
    //   return [null, `Since Admin not found, cannot change ownership.`];
    // }

    const [{ access_token, instance_url }, errForAccessToken] =
      await AccessTokenHelper.getAccessToken({
        integration_type: toUser?.Company?.integration_type,
        user_id: administrator.user_id,
      });
    if (errForAccessToken) {
      logger.error(
        `Since ${integration_type} access token was not found, not changing ownership.`
      );
      return [
        null,
        `Since ${integration_type} access token was not found, not changing ownership.`,
      ];
    }

    if (
      [
        LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD,
        LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD,
      ].includes(lead.integration_type) ||
      ([
        LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT,
        LEAD_INTEGRATION_TYPES.SELLSY_CONTACT,
        LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT,
      ].includes(lead.integration_type) &&
        contact_reassignment_rule !==
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS)
    ) {
      leadTransaction = await sequelize.transaction();
      // update in our db
      const [leadUpdate, errForLeadUpdate] = await Repository.update({
        tableName: DB_TABLES.LEAD,
        query: { lead_id: lead.lead_id },
        updateObject: { user_id: toUserId },
        t: leadTransaction,
      });
      if (errForLeadUpdate) {
        leadTransaction.rollback();
        logger.error(`Error while changing Lead owner in db.`);
        return [null, `Error while changing Lead owner in db.`];
      }
    }

    // update in sf
    if (lead.integration_id) {
      if (
        [
          LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD,
          LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD,
        ].includes(lead.integration_type)
      ) {
        let crmLeadUpdate, errForCrmLeadUpdate, updateAccountObj;
        switch (lead.integration_type) {
          case LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD:
            [crmLeadUpdate, errForCrmLeadUpdate] =
              await SalesforceService.updateLeadOwner(
                lead?.integration_id,
                toUser.integration_id,
                access_token,
                instance_url
              );
            if (errForCrmLeadUpdate) {
              leadTransaction.rollback();
              logger.error(`Could not update salesforce lead owner.`);
              return [null, errForCrmLeadUpdate];
            }
            updateAccountObj = {
              user_id: toUserId,
              salesforce_owner_id: toUser.integration_id,
            };
            break;
          case LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD:
            [crmLeadUpdate, errForCrmLeadUpdate] =
              await v2GrpcClients.crmIntegration.updateLead({
                integration_type: CRM_INTEGRATIONS.DYNAMICS,
                integration_data: {
                  lead: {
                    'ownerid@odata.bind': `systemusers(${toUser.integration_id})`,
                  },
                  lead_id: lead?.integration_id,
                  access_token,
                  instance_url,
                },
              });
            if (errForCrmLeadUpdate) {
              leadTransaction.rollback();
              logger.error(`Could not update dynamics lead owner.`);
              return [null, errForCrmLeadUpdate];
            }
            updateAccountObj = {
              user_id: toUserId,
              integration_id: toUser.integration_id,
            };
            break;
        }

        const [accountUpdate, errForAccountUpdate] = await Repository.update({
          tableName: DB_TABLES.ACCOUNT,
          query: { account_id: lead.account_id },
          updateObject: updateAccountObj,
          t: leadTransaction,
        });
        if (errForAccountUpdate) {
          leadTransaction.rollback();
          logger.error(`Error while changing Account owner in db.`);
          return [null, `Error while changing Account owner in db.`];
        }
        leadTransaction.commit();

        const [taskUpdate, errForTaskUpdate] = await Repository.update({
          tableName: DB_TABLES.TASK,
          query: { lead_id: lead.lead_id },
          updateObject: { user_id: toUserId },
        });
        if (errForTaskUpdate)
          logger.error(`Error while reassigning tasks in db.`);
      } else if (
        [
          LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT,
          LEAD_INTEGRATION_TYPES.SELLSY_CONTACT,
          LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT,
        ].includes(lead.integration_type)
      ) {
        // if true, then update contact
        if (
          [
            COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ONLY,
            COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_AND_ACCOUNT,
          ].includes(contact_reassignment_rule)
        ) {
          let crmContactUpdate, errForCrmContactUpdate;
          switch (lead.integration_type) {
            case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT:
              [crmContactUpdate, errForCrmContactUpdate] =
                await SalesforceService.updateContactOwner(
                  lead?.integration_id,
                  toUser.integration_id,
                  access_token,
                  instance_url
                );

              break;
            case LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT:
              [crmContactUpdate, errForCrmContactUpdate] =
                await v2GrpcClients.crmIntegration.updateContact({
                  integration_type: CRM_INTEGRATIONS.DYNAMICS,
                  integration_data: {
                    contact: {
                      'ownerid@odata.bind': `systemusers(${toUser.integration_id})`,
                    },
                    contact_id: lead?.integration_id,
                    access_token,
                    instance_url,
                  },
                });

              break;
            case LEAD_INTEGRATION_TYPES.SELLSY_CONTACT:
              [crmContactUpdate, errForCrmContactUpdate] =
                await v2GrpcClients.crmIntegration.updateContact({
                  integration_type: CRM_INTEGRATIONS.SELLSY,
                  integration_data: {
                    contact: {
                      owner_id: parseInt(toUser.integration_id),
                    },
                    contact_id: lead?.integration_id,
                    access_token,
                    is_custom: false,
                  },
                });

              break;
          }
          if (errForCrmContactUpdate) {
            leadTransaction.rollback();
            return [null, errForCrmContactUpdate];
          }
          leadTransaction.commit();

          const [taskUpdate, errForTaskUpdate] = await Repository.update({
            tableName: DB_TABLES.TASK,
            query: { lead_id: lead.lead_id },
            updateObject: { user_id: toUserId },
          });
          if (errForTaskUpdate)
            logger.error(`Error while reassigning tasks in db.`);
        }

        // if true, then update accounts as well
        if (
          [
            COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_AND_ACCOUNT,
            COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS,
          ].includes(contact_reassignment_rule) &&
          lead?.Account?.integration_id
        ) {
          accountTransaction = await sequelize.transaction();
          const [accountUpdate, errForAccountUpdate] = await Repository.update({
            tableName: DB_TABLES.ACCOUNT,
            query: { account_id: lead.account_id },
            updateObject: {
              user_id: toUserId,
              salesforce_owner_id: toUser.integration_id,
            },
            t: accountTransaction,
          });
          if (errForAccountUpdate) {
            accountTransaction.rollback();
            logger.error(`Error while changing Account owner in db.`);
            return [null, `Error while changing Account owner in db.`];
          }
          let crmAccountUpdate, errForCrmAccountUpdate;
          switch (lead.integration_type) {
            case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT:
              [crmAccountUpdate, errForCrmAccountUpdate] =
                await SalesforceService.updateAccountOwner(
                  lead?.Account?.integration_id,
                  toUser.integration_id,
                  access_token,
                  instance_url
                );

              break;
            case LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT:
              [crmAccountUpdate, errForCrmAccountUpdate] =
                await v2GrpcClients.crmIntegration.updateAccount({
                  integration_type: CRM_INTEGRATIONS.DYNAMICS,
                  integration_data: {
                    account: {
                      'ownerid@odata.bind': `systemusers(${toUser.integration_id})`,
                    },
                    account_id: lead?.Account?.integration_id,
                    access_token,
                    instance_url,
                  },
                });
              break;
            case LEAD_INTEGRATION_TYPES.SELLSY_CONTACT:
              [crmAccountUpdate, errForCrmAccountUpdate] =
                await v2GrpcClients.crmIntegration.updateAccount({
                  integration_type: CRM_INTEGRATIONS.SELLSY,
                  integration_data: {
                    company: {
                      owner_id: parseInt(toUser.integration_id),
                    },
                    company_id: lead?.Account?.integration_id,
                    access_token,
                    is_custom: false,
                  },
                });
              break;
          }

          if (errForCrmAccountUpdate) {
            accountTransaction.rollback();
            return [null, errForCrmAccountUpdate];
          }

          accountTransaction.commit();

          // if true, update other contacts of accounts as well
          if (
            contact_reassignment_rule ===
            COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS
          ) {
            const [accountContacts, errForAccountContacts] =
              await Repository.fetchAll({
                tableName: DB_TABLES.LEAD,
                query: {
                  account_id: lead.account_id,
                  integration_type: lead.integration_type,
                },
                extras: {
                  attributes: [
                    'lead_id',
                    'salesforce_contact_id',
                    'integration_id',
                  ],
                },
              });

            if (errForAccountContacts) {
              logger.error(
                `Error while fetching account contacts: ${errForAccountContacts}.`
              );
              return [
                null,
                `Error while fetching account contacts: ${errForAccountContacts}.`,
              ];
            }
            let updatedContacts, errForUpdatedContacts;
            switch (lead.integration_type) {
              case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT:
                [updatedContacts, errForUpdatedContacts] =
                  await SalesforceService.bulkUpdateContactOwner(
                    accountContacts,
                    toUser.integration_id,
                    access_token,
                    instance_url
                  );
                break;
              case LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT:
                [updatedContacts, errForUpdatedContacts] =
                  await v2GrpcClients.crmIntegration.bulkUpdateContactOwners({
                    integration_type: CRM_INTEGRATIONS.DYNAMICS,
                    integration_data: {
                      contacts: accountContacts,
                      ownerId: toUser.integration_id,
                      access_token,
                      instance_url,
                    },
                  });
                break;
              case LEAD_INTEGRATION_TYPES.SELLSY_CONTACT:
                [updatedContacts, errForUpdatedContacts] =
                  await v2GrpcClients.crmIntegration.bulkUpdateContactOwners({
                    integration_type: CRM_INTEGRATIONS.SELLSY,
                    integration_data: {
                      contacts: accountContacts,
                      ownerId: parseInt(toUser.integration_id),
                      access_token,
                    },
                  });
                break;
            }

            if (updatedContacts?.length) {
              logger.info(
                `Successfully updated contacts, now updating in our db.`
              );
              let [data, err] = await Repository.update({
                tableName: DB_TABLES.LEAD,
                query: {
                  lead_id: {
                    [Op.in]: updatedContacts,
                  },
                },
                updateObject: {
                  user_id: toUserId,
                },
              });
              if (!err) {
                logger.info(`Successfully updated contacts in db.`);

                await Repository.update({
                  tableName: DB_TABLES.TASK,
                  query: {
                    lead_id: {
                      [Op.in]: updatedContacts,
                    },
                  },
                  updateObject: {
                    user_id: toUserId,
                  },
                });
              }
            }
          }
        }
      }
    }

    logger.info(`Ownership changed successfully.`);
    return [`Ownership changed successfully.`, null];
  } catch (err) {
    if (accountTransaction) accountTransaction.rollback();
    if (leadTransaction) leadTransaction.rollback();
    logger.error(`Error while changing owner: `, err);
    return [null, err.message];
  }
};

module.exports = changeOwner;
