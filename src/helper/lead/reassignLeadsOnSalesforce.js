// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { COMPANY_CONTACT_REASSIGNMENT_OPTIONS } = require('../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const SalesforceService = require('../../services/Salesforce');

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
}) => {
  /*
   * All updates in our tool is commented, since it will be handled by webhooks of owner change for lead,contact and account.
   * Hence transaction is also not used.
   *
   * */
  //const t = await sequelize.transaction();
  // console.log(reassignToForLeads , reassignToForContacts)
  try {
    logger.info('Reassignment started.');

    // re-assign to other user
    let i = 0;
    // * store previous user count to get range for next user
    let previousUserCount = 0;

    let leadsForUser = [];
    let accountsForUser = [];

    // reassignment for leads
    // reassign in sf
    // if successful, reassign leads and task in our db
    for (let reassignToData of reassignToForLeads) {
      if (leads?.length == 0) break;
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

      if (i === 0) leadsForUser = leads.slice(0, reassignToData?.count);
      else if (i === reassignToForLeads?.length)
        leadsForUser = leads.slice(
          reassignToData?.count,
          reassignToForLeads?.length
        );
      else
        leadsForUser = leads.slice(
          previousUserCount,
          previousUserCount + reassignToData?.count
        );

      //update previousUserCount
      previousUserCount += reassignToData?.count;

      const [updatedLeads, errForUpdatedLeads] =
        await SalesforceService.bulkUpdateLeadOwner(
          leadsForUser,
          reassignToUser.salesforce_owner_id,
          access_token,
          instance_url
        );

      // console.log( leadsForUser )
      if (errForUpdatedLeads) throw new Error(errForUpdatedLeads);
      //updatedLeads = leadsForUser.map((lead) => lead.lead_id);
      if (updatedLeads?.length)
        logger.info(`Successfully updated leads in salesforce.`);

      i++;
    }

    let contactsForUser = [];
    accountsForUser = [];
    previousUserCount = 0;
    i = 0; // re-initialiaze

    // reassignment for contacts
    for (let reassignToData of reassignToForContacts) {
      if (contacts?.length == 0) break;
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

      if (i === 0) contactsForUser = contacts.slice(0, reassignToData?.count);
      else if (i === reassignToForContacts?.length)
        contactsForUser = contacts.slice(
          reassignToData?.count,
          reassignToForContacts?.length
        );
      else
        contactsForUser = contacts.slice(
          previousUserCount,
          previousUserCount + reassignToData?.count
        );

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
        accountsForUser = contactsForUser
          .filter(
            (contact) =>
              Boolean(contact?.Account) && Boolean(contact?.Account?.Id)
          )
          .map((contact) => contact?.Account);

        [updatedAccounts, errForUpdatedAccounts] =
          await SalesforceService.bulkUpdateAccountOwner(
            accountsForUser,
            reassignToUser.salesforce_owner_id,
            access_token,
            instance_url
          );

        if (updatedAccounts?.length)
          logger.info(`Successfully updated accounts in salesforce.`);
      }

      // if true, then update contact
      if (
        [
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ONLY,
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_AND_ACCOUNT,
        ].includes(contact_reassignment_rule)
      ) {
        let tempContactsForUser = contactsForUser.filter((contact) =>
          Boolean(contact?.Id)
        );

        [updatedContacts, errForUpdatedContacts] =
          await SalesforceService.bulkUpdateContactOwner(
            tempContactsForUser,
            reassignToUser.salesforce_owner_id,
            access_token,
            instance_url
          );

        if (errForUpdatedContacts) throw new Error(errForUpdatedContacts);
        //updatedContacts = contactsForUser.map((contact) => contact.lead_id);

        if (updatedContacts?.length)
          logger.info(`Successfully updated contacts in salesforce.`);
      }

      if (
        [
          COMPANY_CONTACT_REASSIGNMENT_OPTIONS.CONTACT_ACCOUNT_AND_OTHER_CONTACTS,
        ].includes(contact_reassignment_rule)
      ) {
        const st = new Set(updatedAccounts);
        updatedAccounts = Array.from(st);
        // const [neededAccs , errForNeededAccs] =
        // await Repository.fetchAll({
        //         tableName: DB_TABLES.ACCOUNT,
        //         query: {
        //         salesforce_account_id: {
        //             [Op.in]: updatedAccounts,
        //         }
        //         },
        //         attributes: ['account_id']
        //         //t,
        //     });
        // console.log("neeede",neededAccs)

        const [neededContacts, errForNeededContacts] =
          await SalesforceService.getAllContactsFromAccount(
            updatedAccounts,
            instance_url,
            access_token
          );
        if (errForNeededContacts) {
          logger.error(
            `Error while fetching account : ${errForNeededContacts}.`
          );
          i++;
          continue;
        }

        const accountContacts = neededContacts?.records?.map((contact) => ({
          Id: contact.Id,
        }));
        // console.log(accountContacts)
        // const [accountContacts, errForAccountContacts] =
        //   await Repository.fetchAll({
        //     tableName: DB_TABLES.LEAD,
        //     query: {
        //       account_id: {
        //         [Op.in]: accountsIds,
        //       },
        //       salesforce_contact_id: {
        //         [Op.ne]: null,
        //       },
        //     },
        //     //t,
        //   });
        //   console.log("accCont", accountContacts)
        // if (errForAccountContacts) {
        //   logger.error(
        //     `Error while fetching account contacts: ${errForAccountContacts}.`
        //   );
        //   i++;
        //   continue;
        // }
        [updatedContacts, errForUpdatedContacts] =
          await SalesforceService.bulkUpdateContactOwner(
            accountContacts,
            reassignToUser?.salesforce_owner_id,
            access_token,
            instance_url
          );

        if (errForUpdatedContacts) throw new Error(errForUpdatedContacts);
        //updatedContacts = accountContacts.map((contact) => contact.lead_id);
        // console.log("updContacts",updatedContacts)
        if (updatedContacts?.length)
          logger.info(`Successfully updated contacts in salesforce`);
      }

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
