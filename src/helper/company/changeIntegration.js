// Utils
const logger = require('../../utils/winston');
const {
  INTEGRATION_CHANGE_OPTIONS,
  CRM_INTEGRATIONS,
  USER_INTEGRATION_TYPES,
  COMPANY_STATUS,
} = require('../../utils/enums');
const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');
const { MARKETPLACE_URL, DEV_AUTH } = require('../../utils/config');
const {
  INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
} = require('../../utils/constants');

// Packages
const { QueryTypes } = require('sequelize');
const axios = require('axios');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const handleDeleteForIntegrationChange = require('./handleDeleteForIntegrationChange');
const handleIntegrationTokensForIntegrationChange = require('./handleIntegrationTokensForIntegrationChange');
const getIntegrationSpecificThings = require('./getIntegrationSpecificThings');
const sendIntegrationChangeLogsEvent = require('../socket/sendIntegrationChangeLogsEvent');

/**
  changes integration for a company
  @param {string} company_id id of the company whose integration you want to change 
  @param {string} currentIntegration 
  current integration of the company
  enum to be used: CRM_INTEGRATIONS 
  @param {string} changeToIntegration 
  new integration to which company should be updated
  enum to be used: CRM_INTEGRATIONS 
  @param {string} option 
  option to apply while changing integration
  enum to be used: INTEGRATION_CHANGE_OPTIONS
  @param {string} super_admin_user_id id of the super admin
  @param {string} super_admin_email email of the super admin
  
  @param t sequelize.transaction
 */
const changeIntegration = async ({
  company_id,
  currentIntegration,
  changeToIntegration,
  option,
  super_admin_user_id,
  super_admin_email,
  t,
}) => {
  try {
    /*
     * Step: checks for function arguments
     *
     * Step: delete all things according to the options
     * handled by helper ./handleDeleteForIntegrationChange(see this file for the delete process)
     *
     * Step: sign out all users from their crm's i.e delete rows from their tokens table and create entry in new tokens row
     * Step: update type for company, users, leads
     * Step: handle field map table and extension field map table
     * Step: handle enrichments table
     * Step: update info in marketplace for super admin
     * Step: log out all users
     * */
    // Step: Checks for function arguments
    if (!Object.values(CRM_INTEGRATIONS).includes(changeToIntegration))
      return [
        null,
        `Invalid value: ${changeToIntegration} found for changeIntegration`,
      ];
    if (!Object.values(INTEGRATION_CHANGE_OPTIONS).includes(option))
      return [null, `${option} not supported`];

    // Step: get integration specific things
    // for changeToIntegration
    const [
      changeToIntegrationSpecificThings,
      errForChangeToIntegrationSpecificThings,
    ] = getIntegrationSpecificThings(changeToIntegration);
    if (errForChangeToIntegrationSpecificThings)
      return [null, errForChangeToIntegrationSpecificThings];
    console.log(
      `changeToIntegrationSpecificThings: `,
      changeToIntegrationSpecificThings
    );
    // for currentIntegration
    const [
      currentIntegrationSpecificThings,
      errForCurrentIntegrationSpecificThings,
    ] = getIntegrationSpecificThings(currentIntegration);
    if (errForCurrentIntegrationSpecificThings)
      return [null, errForCurrentIntegrationSpecificThings];
    console.log(
      `currentIntegrationSpecificThings: `,
      currentIntegrationSpecificThings
    );

    // Step: Declare variables
    // log text for deleted things depending on the option selected
    const logsForOption = {
      [INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING]: 'leads',
      [INTEGRATION_CHANGE_OPTIONS.START_FROM_SCRATCH]:
        'leads,workflows,settings and cadences',
      [INTEGRATION_CHANGE_OPTIONS.KEEP_CADENCES_AND_SETTINGS]:
        'leads and workflows',
    };
    // array to store all the logs for change integration which will be sent in frontend via socket
    let changeIntegrationLogs = [
      `Deleting and setting default ${logsForOption[option]}`,
      `Deleting tokens for existing integration`,
      `Setting field map`,
      `Preparing new set up`,
      //`Preparing marketplace`,
      `Logging out all users`,
    ];
    // indicates the current step from above array
    let current_step = 0;
    // logs to return at any point
    let logs = { logs: changeIntegrationLogs, current_step };
    // user's integration id after integration change
    let user_integration_id = null;

    // Step:  delete all things according to the options
    sendIntegrationChangeLogsEvent({
      email: super_admin_email,
      logs,
    });
    const [deletions, errForDeletions] = await handleDeleteForIntegrationChange(
      {
        company_id,
        option,
        current_integration: currentIntegration,
        integration: changeToIntegration,
        super_admin_user_id,
        super_admin_email,
        t,
      }
    );
    if (errForDeletions) return [null, errForDeletions];

    // Step: sign out all users from their crm's i.e delete rows from their tokens table and create entry in new tokens row
    logs.current_step = 1;
    sendIntegrationChangeLogsEvent({
      email: super_admin_email,
      logs,
    });
    const [integrationTokens, errForIntegrationTokens] =
      await handleIntegrationTokensForIntegrationChange({
        company_id,
        integration: changeToIntegration,
        current_integration: currentIntegration,
        t,
      });
    if (errForIntegrationTokens) return [null, errForIntegrationTokens];

    // Step: handle field map table and extension field map table
    logs.current_step = 2;
    sendIntegrationChangeLogsEvent({
      email: super_admin_email,
      logs,
    });
    // delete old tables and create new ones
    // Step: handle enrichments table
    let promisesForFieldMapAndEnrichments = [];
    // destructure field map and extension field map tables to create and delete
    let fieldMapTableToDelete = currentIntegrationSpecificThings?.fieldMapTable;
    let extensionFieldMapTableToDelete =
      currentIntegrationSpecificThings?.extensionFieldMapTable;
    let fieldMapTableToCreate =
      changeToIntegrationSpecificThings?.fieldMapTable;
    let extensionFieldMapTableToCreate =
      changeToIntegrationSpecificThings?.extensionFieldMapTable;
    let enrichments = changeToIntegrationSpecificThings?.enrichments;
    // check if all required tables are present
    if (
      !fieldMapTableToDelete ||
      !extensionFieldMapTableToDelete ||
      !fieldMapTableToCreate ||
      !extensionFieldMapTableToCreate
    ) {
      console.log(`field maps: `, {
        fieldMapTableToDelete,
        extensionFieldMapTableToDelete,
        fieldMapTableToCreate,
        extensionFieldMapTableToCreate,
      });
      return [null, `Some of the field map tables missing`];
    }
    if (!enrichments)
      return [null, `Enrichments not found for ${changeToIntegration}`];

    // delete old tables
    // delete field map table
    if (fieldMapTableToDelete) {
      let deleteQuery = `delete \`${fieldMapTableToDelete}\` from \`${fieldMapTableToDelete}\` inner join \`company_settings\` on \`${fieldMapTableToDelete}\`.company_settings_id=\`company_settings\`.company_settings_id where \`company_settings\`.company_id='${company_id}'`;
      console.log(`deleteQuery: `, deleteQuery);
      promisesForFieldMapAndEnrichments.push(
        Repository.runRawDeleteQuery({
          rawQuery: deleteQuery,
          t,
        })
      );
    }
    // delete extension field map table
    if (extensionFieldMapTableToDelete) {
      let deleteQuery = `delete \`${extensionFieldMapTableToDelete}\` from \`${extensionFieldMapTableToDelete}\` inner join \`company_settings\` on \`${extensionFieldMapTableToDelete}\`.company_settings_id=\`company_settings\`.company_settings_id where \`company_settings\`.company_id='${company_id}'`;
      console.log(`deleteQuery: `, deleteQuery);
      promisesForFieldMapAndEnrichments.push(
        Repository.runRawDeleteQuery({
          rawQuery: deleteQuery,
          t,
        })
      );
    }
    // create new tables
    // create field map table
    if (fieldMapTableToCreate) {
      let insertQuery = `
insert into \`${fieldMapTableToCreate}\`(company_settings_id,created_at,updated_at)
select company_settings_id,now(),now() from company_settings where company_id=:company_id
			`;
      promisesForFieldMapAndEnrichments.push(
        Repository.runRawQuery({
          rawQuery: insertQuery,
          tableName: DB_MODELS[fieldMapTableToCreate],
          include: [],
          replacements: {
            company_id,
          },
          extras: {
            type: QueryTypes.INSERT,
            returning: true,
          },
          t,
        })
      );
    }
    // create extension field map table
    if (extensionFieldMapTableToCreate) {
      let insertQuery = `
insert into \`${extensionFieldMapTableToCreate}\`(company_settings_id,created_at,updated_at)
select company_settings_id,now(),now() from company_settings where company_id=:company_id
			`;
      promisesForFieldMapAndEnrichments.push(
        Repository.runRawQuery({
          rawQuery: insertQuery,
          tableName: DB_MODELS[extensionFieldMapTableToCreate],
          include: [],
          replacements: {
            company_id,
          },
          extras: {
            type: QueryTypes.INSERT,
            returning: true,
          },
          t,
        })
      );
    }
    // update enrichments
    if (enrichments) {
      promisesForFieldMapAndEnrichments.push(
        Repository.update({
          tableName: DB_TABLES.ENRICHMENTS,
          query: {
            company_id,
          },
          updateObject: {
            ...enrichments,
          },
          t,
        })
      );
    }
    // Resolve promises
    let resolvedPromises = await Promise.all(promisesForFieldMapAndEnrichments);
    // looping through promises to ensure there were no errors
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
      console.log(data);
    }

    // Step: update type for company, users, leads
    logs.current_step = 3;
    sendIntegrationChangeLogsEvent({
      email: super_admin_email,
      logs,
    });
    // change integration types for Google sheets/CSV leads
    //  change integration types for Google sheets/CSV leads - Blocked since this is only supported in salesforce at the time of development i.e. !7 July 2023
    // update lead types for google sheets leads
    //let integrationTypesToUpdateTo = {
    //[CRM_INTEGRATIONS.SALESFORCE]: {
    //google: LEAD_INTEGRATION_TYPES.SALESFORCE_GOOGLE_SHEET_LEAD,
    //excel: LEAD_INTEGRATION_TYPES.SALESFORCE_CSV_LEAD,
    //},
    //};
    let promisesForTypesUpdates = [];
    // check if userIntegration is fetched for changeToIntegration
    if (!changeToIntegrationSpecificThings?.userIntegration)
      return [null, `no user integration found for ${changeToIntegration}`];
    // change integration type for company
    promisesForTypesUpdates.push(
      Repository.update({
        tableName: DB_TABLES.COMPANY,
        query: { company_id },
        updateObject: { integration_type: changeToIntegration },
        t,
      })
    );
    // if integration_type is CRM_INTEGRATIONS.SHEETS then we need to update integration_id as well to timestamp
    if (changeToIntegration === CRM_INTEGRATIONS.SHEETS) {
      //user_integration_id = `S${new Date().getTime()}`;
      // change integration type for users
      promisesForTypesUpdates.push(
        Repository.runRawUpdateQuery({
          rawQuery: `
update (
select *,row_number() over(partition by company_id) as row_num,unix_timestamp()*1000 as timestamp from user where company_id=:company_id
) target_user inner join user on target_user.user_id=user.user_id set user.integration_id=concat("S",timestamp+row_num),user.integration_type=:integration_type 

				`,
          replacements: {
            company_id,
            integration_type:
              changeToIntegrationSpecificThings?.userIntegration,
          },
          extras: { logging: console.log },
          t,
        })
      );
    } else
      promisesForTypesUpdates.push(
        Repository.update({
          tableName: DB_TABLES.USER,
          query: { company_id },
          updateObject: {
            integration_type:
              changeToIntegrationSpecificThings?.userIntegration,
            integration_id: user_integration_id,
          },
          extras: { logging: console.log },
          t,
        })
      );
    // update integration types for cadence
    promisesForTypesUpdates.push(
      Repository.runRawUpdateQuery({
        rawQuery: `
update cadence set integration_type=:integration_type,salesforce_cadence_id = case when salesforce_cadence_id=:product_tour_cadence_id then :product_tour_cadence_id else null end where company_id=:company_id
				`,
        replacements: {
          company_id,
          integration_type: changeToIntegration,
          product_tour_cadence_id: INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
        },
        extras: { logging: console.log },
        t,
      })
    );
    //Repository.update({
    //tableName: DB_TABLES.USER,
    //query: { company_id },
    //updateObject: {
    //integration_type: changeToIntegrationSpecificThings?.userIntegration,
    //integration_id: user_integration_id,
    //},
    //extras: { logging: console.log },
    //t,
    //})
    //);
    // resolve promises
    resolvedPromises = await Promise.all(promisesForTypesUpdates);
    // looping through promises to ensure there were no errors
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
      console.log(data);
    }

    // Step: update info in marketplace for super admin
    //logs.current_step = 4;
    //sendIntegrationChangeLogsEvent({
    //email: super_admin_email,
    //logs,
    //});
    //const resp = await axios.put(
    //`${MARKETPLACE_URL}/v1/integrations/type`,
    //{
    //company_id,
    //type: changeToIntegration,
    //},
    //{
    //headers: {
    //Authorization: `Bearer ${DEV_AUTH}`,
    //'Content-Type': 'application/json',
    //},
    //}
    //);

    // Step: logout all users and update company status
    logs.current_step = 4;
    sendIntegrationChangeLogsEvent({
      email: super_admin_email,
      logs,
    });
    let promisesToLogoutAllUsersAndUpdateCompanyStatus = [];
    // update company status
    promisesToLogoutAllUsersAndUpdateCompanyStatus.push(
      Repository.update({
        tableName: DB_TABLES.COMPANY,
        query: { company_id },
        updateObject: {
          status: COMPANY_STATUS.NOT_CONFIGURED_AFTER_INTEGRATION_CHANGE,
        },
        t,
      })
    );
    // logout all users
    let queryToLogoutAllUsers = `delete rt from ringover_tokens rt inner join user u on rt.user_id=u.user_id where u.company_id=:company_id;`;
    promisesToLogoutAllUsersAndUpdateCompanyStatus.push(
      Repository.runRawDeleteQuery({
        rawQuery: queryToLogoutAllUsers,
        replacements: { company_id },
        t,
      })
    );
    // resolve all promises
    resolvedPromises = await Promise.all(
      promisesToLogoutAllUsersAndUpdateCompanyStatus
    );
    // looping through promises to check if error occured for any process
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
      console.log(data);
    }

    return [`Changed integration successfully`, null];
  } catch (err) {
    if (err?.response?.data) logger.error(JSON.stringify(err.response.data));
    logger.error(`Error while changing integration: `, err);
    return [null, err.message];
  }
};

module.exports = changeIntegration;
