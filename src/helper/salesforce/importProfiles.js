// Utils
const logger = require('../../utils/winston');
const {
  SALESFORCE_SOBJECTS,
  PROFILE_IMPORT_TYPES,
} = require('../../utils/enums');

// Helpers and services
const getFieldMapForCompany = require('./getFieldMapForCompany');
const SalesforceService = require('../../services/Salesforce');

const importProfiles = async ({
  profiles,
  type,
  user,
  access_token,
  instance_url,
}) => {
  try {
    let result = {
      success: [],
      error: [],
    };
    let query = 'SELECT Id FROM ';

    console.log({
      profiles,
      type,
      user,
      access_token,
      instance_url,
    });
    for (let profile of profiles) {
      logger.info(`Trying to import ${profile.linkedinUrl} to salesforce...`);
      let data = {};

      //if (type === PROFILE_IMPORT_TYPES.LEAD) {
      // * Fetch salesforce field map
      let [salesforceFieldMapForLead, errFetchingSalesforceFieldMapForLead] =
        await getFieldMapForCompany(user.user_id, SALESFORCE_SOBJECTS.LEAD);
      if (errFetchingSalesforceFieldMapForLead) {
        result.error.push({
          linkedinUrl: profile.linkedinUrl,
          error_message: errFetchingSalesforceFieldMapForLead,
        });
        continue;
      }
      //return serverErrorResponse(res, errFetchingSalesforceFieldMapForLead);

      let leadQuery = query;
      leadQuery += `LEAD WHERE `;

      salesforceFieldMapForLead?.emails.map((email_field) => {
        leadQuery += `${email_field}='${profile?.email}'`;
      });
      logger.info(`QUERY FOR CHECKING DUPLICATE LEAD: ${leadQuery}`);

      const [leadData, errForLeadData] = await SalesforceService.query(
        leadQuery,
        access_token,
        instance_url
      );
      console.log(leadData, errForLeadData);

      // duplicate case
      if (leadData?.totalSize) {
        logger.error(`Duplicate exists in salesforce.`);
        result.error.push({
          linkedinUrl: profile.linkedinUrl,
          error_message: `Duplicate exists in salesforce.`,
        });
        continue;
        //return badRequestResponse(res, `Duplicate exists in salesforce.`);
      }
      //} else if (type === PROFILE_IMPORT_TYPES.CONTACT) {
      // * Fetch salesforce field map
      let [
        salesforceFieldMapForContact,
        errFetchingSalesforceFieldMapForContact,
      ] = await getFieldMapForCompany(
        user.user_id,
        SALESFORCE_SOBJECTS.CONTACT
      );
      if (errFetchingSalesforceFieldMapForContact) {
        result.error.push({
          linkedinUrl: profile.linkedinUrl,
          error_message: errFetchingSalesforceFieldMapForContact,
        });
        continue;
        //return serverErrorResponse(
        //res,
        //errFetchingSalesforceFieldMapForContact
        //);
      }
      let contactQuery = query;

      contactQuery += `CONTACT WHERE `;
      salesforceFieldMapForContact?.emails.map((email_field) => {
        contactQuery += `${email_field}='${profile?.email}'`;
      });
      logger.info(`QUERY FOR CHECKING DUPLICATE CONTACT: ${contactQuery}`);

      const [contactData, errForContactData] = await SalesforceService.query(
        contactQuery,
        //"SELECT FIELDS(ALL) FROM LEAD WHERE Id='00Q5g000007IEGuEAO'",
        access_token,
        instance_url
      );
      console.log(contactData, errForContactData);

      // duplicate case
      if (contactData?.totalSize) {
        logger.error(`Duplicate exists in salesforce.`);
        result.error.push({
          linkedinUrl: profile.linkedinUrl,
          error_message: `Duplicate exists in salesforce.`,
        });
        continue;
        //return badRequestResponse(res, `Duplicate exists in salesforce.`);
      }
      // check for duplicate account only if we are creating contact
      if (type === PROFILE_IMPORT_TYPES.CONTACT) {
        // * Fetch salesforce field map
        let [accountSalesforceFieldMap, errFetchingAccountSalesforceFieldMap] =
          await getFieldMapForCompany(
            user.user_id,
            SALESFORCE_SOBJECTS.ACCOUNT
          );
        if (errFetchingAccountSalesforceFieldMap) {
          result.error.push({
            linkedinUrl: profile.linkedinUrl,
            error_message: errFetchingAccountSalesforceFieldMap,
          });
          continue;
          //return serverErrorResponse(res, errFetchingAccountSalesforceFieldMap);
        }
        let accountQuery = query;

        accountQuery += `ACCOUNT WHERE ${accountSalesforceFieldMap?.name}='${profile.companyName}'`;
        logger.info(`QUERY FOR CHECKING DUPLICATE ACCOUNT: ${accountQuery}`);

        const [accountData, errForAccountData] = await SalesforceService.query(
          accountQuery,
          access_token,
          instance_url
        );
        console.log(accountData, errForAccountData);

        // duplicate case
        if (accountData?.totalSize && accountData?.records?.[0]?.Id) {
          logger.info(`Duplicate exists in salesforce.`);

          logger.info(
            `Salesforce Account id: ${accountData?.records?.[0]?.Id}`
          );
          profile.accountId = accountData?.records?.[0]?.Id;
        }
      }

      let leadObject = {
        LastName: profile.lastName,
        FirstName: profile.firstName,
        Title: profile.position.substring(0, 128),
        //Name: `${profile.firstName} ${profile.lastName}`,
        Company: profile.companyName,
        Effectif_Linkedin__c: profile.companySize,
        Linkedin__c: profile.linkedinUrl,
        PostalCode: profile.companyPostal,
        Country: profile.companyCountry,
        Phone: profile.phone,
        MobilePhone: profile.mobilePhone,
        Email: profile.email,
        OwnerId: user.salesforce_owner_id,
      };

      if (type === PROFILE_IMPORT_TYPES.LEAD) {
        logger.info(`Creating lead...`);

        const [createdLead, errForCreatedLead] =
          await SalesforceService.createLead(
            leadObject,
            access_token,
            instance_url
          );
        if (errForCreatedLead) {
          if (errForCreatedLead?.includes('DUPLICATES_DETECTED')) {
            logger.error(`Duplicate exists in salesforce.`);
            result.error.push({
              linkedinUrl: profile.linkedinUrl,
              error_message: `Duplicate exists in salesforce.`,
            });
            continue;
          }
          //return badRequestResponse(res, `Duplicate exists in salesforce.`);
          result.error.push({
            linkedinUrl: profile.linkedinUrl,
            error_message: `Error while creating lead in salesforce: ${errForCreatedLead}.`,
          });
          continue;
          //return serverErrorResponse(
          //res,
          //`Error while creating lead in salesforce: ${errForCreatedLead}.`
          //);
        }
        data = leadObject;

        profile.salesforce_lead_id = createdLead.id;
        logger.info(
          `Created Lead: ${
            profile.firstName + ' ' + profile.lastName
          } with salesforce lead id: ${createdLead.id}.`
        );

        data.salesforce_lead_id = createdLead.id;

        result.success.push({
          linkedinUrl: profile.linkedinUrl,
          ...data,
        });
      } else if (type === PROFILE_IMPORT_TYPES.CONTACT) {
        // if no account found, create it
        if (!profile?.accountId) {
          logger.info(`Creating Account: ${profile.companyName}...`);
          let accountObject = {
            Name: profile.companyName,
            Effectif__c: profile.companySize,
            BillingCountry: profile.companyCountry,
            Phone: profile.companyPhone,
            OwnerId: user.salesforce_owner_id,
            Linkedin_Societe__c: profile.companySocialUrl,
          };

          const [createdAccount, errForCreatedAccount] =
            await SalesforceService.createAccount(
              accountObject,
              access_token,
              instance_url
            );
          if (errForCreatedAccount) {
            if (errForCreatedAccount?.includes('DUPLICATES_DETECTED')) {
              logger.error(`Duplicate exists in salesforce.`);
              result.error.push({
                linkedinUrl: profile.linkedinUrl,
                error_message: `Duplicate exists in salesforce.`,
              });
              continue;
            }
            //return badRequestResponse(res, `Duplicate exists in salesforce.`);
            result.error.push({
              linkedinUrl: profile.linkedinUrl,
              error_message: `Error while creating account in salesforce: ${errForCreatedAccount}.`,
            });
            //return serverErrorResponse(
            //res,
            //`Error while creating account in salesforce: ${errForCreatedAccount}.`
            //);
          }
          logger.info(
            `Created Account: ${profile.companyName} with salesforce account id: ${createdAccount.id}.`
          );
          profile.accountId = createdAccount.id;
          data.Account = {
            salesforce_account_id: createdAccount.id,
            ...accountObject,
          };
        } else {
          const accountSOQLQuery = `SELECT Name,Effectif__c,BillingCountry,Phone,OwnerId,Linkedin_Societe__c FROM ACCOUNT WHERE Id='${profile.accountId}'`;
          logger.info(`Account Query: ${accountSOQLQuery}`);
          const [accountQuery, errForAccountQuery] =
            await SalesforceService.query(
              accountSOQLQuery,
              access_token,
              instance_url
            );
          if (errForAccountQuery) {
            result.error.push({
              linkedinUrl: profile.linkedinUrl,
              error_message: `Error while fetching account from salesforce.`,
            });
          }
          //return serverErrorResponse(
          //res,
          //`Error while fetching account from salesforce.`
          //);

          data.Account = accountQuery?.records?.[0];
          data.Account.salesforce_account_id = profile.accountId;
        }

        logger.info(`Creating contact...`);

        let contactObject = leadObject;

        contactObject.URL_Profil_Linkedin__c = contactObject.Linkedin__c;

        delete contactObject.Company;
        delete contactObject.Effectif_Linkedin__c;
        delete contactObject.PostalCode;
        delete contactObject.Country;
        delete contactObject.Linkedin__c;

        contactObject.AccountId = profile.accountId;

        const [createdContact, errForCreatedContact] =
          await SalesforceService.createContact(
            contactObject,
            access_token,
            instance_url
          );
        if (errForCreatedContact) {
          if (errForCreatedContact?.includes('DUPLICATES_DETECTED')) {
            logger.error(`Duplicate exists in salesforce.`);
            result.error.push({
              linkedinUrl: profile.linkedinUrl,
              error_message: `Duplicate exists in salesforce.`,
            });
            continue;
          }
          //return badRequestResponse(res, `Duplicate exists in salesforce.`);
          result.error.push({
            linkedinUrl: profile.linkedinUrl,
            error_message: `Error while creating contact in salesforce: ${errForCreatedContact}.`,
          });
          //return serverErrorResponse(
          //res,
          //`Error while creating contact in salesforce: ${errForCreatedContact}.`
          //);
        }

        data = {
          ...data,
          ...contactObject,
        };
        profile.salesforce_contact_id = createdContact.id;
        logger.info(
          `Created Contact: ${
            profile.firstName + ' ' + profile.lastName
          } with salesforce contact id: ${createdContact.id}.`
        );

        data.salesforce_contact_id = createdContact.id;
        data.salesforce_account_id = profile.accountId;

        result.success.push({
          linkedinUrl: profile.linkedinUrl,
          ...data,
        });
      }
    } // for loop end

    return [result, null];
  } catch (err) {
    logger.error(`Error while importing profiles to salesforce: `, err);
    return [null, err.message];
  }
};

module.exports = importProfiles;
