// Utils
const logger = require('../../utils/winston');
const {
  INTEGRATION_CHANGE_OPTIONS,
  CRM_INTEGRATIONS,
  LEAD_INTEGRATION_TYPES_TO_BE_DELETED_ON_INTEGRATION_CHANGE,
  SETTING_LEVELS,
  NODE_TYPES,
  WORKFLOW_TRIGGERS,
  WORKFLOW_ACTIONS,
  WORKFLOW_DEFAULT_NAMES,
  IMPORTED_LEAD_SOURCE,
  GOOGLE_SHEET_CSV_LEADS_INTEGRATION_TYPES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Db
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const deleteAllLeadInfo = require('../lead/deleteAllLeadInfo');
const createMockCadences = require('../cadence/createMockCadences');

/**
  deletes all leads for the company which are associated with integration(if option is INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING then excludes Google sheets/csv leads in the integration e.g. SALESFORCE_GOOGLE_SHEET_LEAD, SALESFORCE_CSV_LEAD and updates their type to google_sheet/csv lead type for integration)
  @param {string} company_id id of the company whose integration you want to change 
  @param {string} option 
  option to apply while changing integration
  enum to be used: INTEGRATION_CHANGE_OPTIONS
  @param {string} current_integration 
  current integration of the company
  enum to be used: CRM_INTEGRATIONS 
  @param {string} integration 
  new integration to which company should be updated
  enum to be used: CRM_INTEGRATIONS 

  @param t sequelize.transaction
 * */
const handleLeadsDeletionAndRetention = async ({
  company_id,
  option,
  current_integration,
  integration,
  t,
}) => {
  try {
    // Step: deletes all leads for the company which are associated with integration
    // will contain ids of leads that needs to be deleted
    let leadIdsToDelete = [];
    // will contain ids of accounts that needs to be deleted
    let accountIdsToDelete = [];
    // if true, only then delete leads
    let toDeleteLeads = true;
    // empty for case of integrations CRM_INTEGRATIONS.GOOGLE_SHEETS and CRM_INTEGRATIONS.EXCEL
    let leadIntegrationTypesToDelete =
      LEAD_INTEGRATION_TYPES_TO_BE_DELETED_ON_INTEGRATION_CHANGE[
        current_integration
      ] || [];
    // will contain integration types for google sheet and csv leads for current_integration and integration
    let leadIntegrationTypesToUpdate = {
      TO: {
        [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
          GOOGLE_SHEET_CSV_LEADS_INTEGRATION_TYPES?.[integration]?.[
            IMPORTED_LEAD_SOURCE.GOOGLE_SHEET
          ],
        [IMPORTED_LEAD_SOURCE.CSV]:
          GOOGLE_SHEET_CSV_LEADS_INTEGRATION_TYPES?.[integration]?.[
            IMPORTED_LEAD_SOURCE.CSV
          ],
      },
      FROM: {
        [IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]:
          GOOGLE_SHEET_CSV_LEADS_INTEGRATION_TYPES?.[current_integration]?.[
            IMPORTED_LEAD_SOURCE.GOOGLE_SHEET
          ],
        [IMPORTED_LEAD_SOURCE.CSV]:
          GOOGLE_SHEET_CSV_LEADS_INTEGRATION_TYPES?.[current_integration]?.[
            IMPORTED_LEAD_SOURCE.CSV
          ],
      },
    };
    // if integration to change to is CRM_INTEGRATIONS.DYNAMICS then google_sheet and csv leads should also be deleted since google_sheet and csv leads are not supported in CRM_INTEGRATIONS.DYNAMICS as of 26/09/23
    if (
      integration === CRM_INTEGRATIONS.DYNAMICS ||
      option !== INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING
    ) {
      console.log('Deleting GS and csv leads');
      console.log({ integration, option });
      if (
        leadIntegrationTypesToUpdate?.FROM?.[IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]
      )
        leadIntegrationTypesToDelete.push(
          leadIntegrationTypesToUpdate?.FROM?.[
            IMPORTED_LEAD_SOURCE.GOOGLE_SHEET
          ]
        );
      if (leadIntegrationTypesToUpdate?.FROM?.[IMPORTED_LEAD_SOURCE.CSV])
        leadIntegrationTypesToDelete.push(
          leadIntegrationTypesToUpdate?.FROM?.[IMPORTED_LEAD_SOURCE.CSV]
        );
    }

    // if current_integration is sheets, and option is INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING then set toDeleteLeads as false as in this case we need to update integration type for all leads instead of deleting
    // if option is anything other than INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING, then delete all leads
    // if integration is CRM_INTEGRATIONS.DYNAMICS then we need to delete leads irrespective of any conditions
    if (
      integration !== CRM_INTEGRATIONS.DYNAMICS &&
      current_integration === CRM_INTEGRATIONS.SHEETS &&
      option === INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING
    )
      toDeleteLeads = false;

    // delete leads only if toDeleteLeads is true
    if (toDeleteLeads) {
      // select leads which needs to be deleted
      const [leadsToBeDeleted, errForLeadsToBeDeleted] =
        await Repository.fetchAll({
          tableName: DB_TABLES.LEAD,
          query: {
            // only leads belonging to this company
            company_id,
            integration_type: leadIntegrationTypesToDelete,
          },
          extras: {
            attributes: ['lead_id', 'account_id'],
            logging: console.log,
          },
          t,
        });
      if (errForLeadsToBeDeleted) return [null, errForLeadsToBeDeleted];
      // if leadsToBeDeleted is an array
      if (Array.isArray(leadsToBeDeleted)) {
        leadsToBeDeleted?.map((leadsToBeDeleted) => {
          if (leadsToBeDeleted.lead_id)
            leadIdsToDelete.push(leadsToBeDeleted.lead_id);
          if (leadsToBeDeleted.account_id)
            accountIdsToDelete.push(leadsToBeDeleted.account_id);
        });
      }
      console.log(`leadIdsToDelete: `, leadIdsToDelete);
      console.log(`accountIdsToDelete: `, accountIdsToDelete);
    }

    // stores all the promises which needs to resolved
    let promisestoResolve = [];
    // if lead to delete found
    if (leadIdsToDelete?.length) {
      promisestoResolve.push(
        deleteAllLeadInfo({
          leadIds: leadIdsToDelete,
          accountIds: accountIdsToDelete,
          t,
        })
      );
    }
    // if option is INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING then retain google_sheet and csv leads by updating their types to integration types for google_sheet and csv of integration
    // if integration is CRM_INTEGRATIONS.DYNAMICS then we don't to retention since CRM_INTEGRATIONS.DYNAMICS does not support google_sheet and csv leads as of 26/09/23
    if (
      option === INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING &&
      integration !== CRM_INTEGRATIONS.DYNAMICS
    ) {
      // if integration type for google sheets leads found for both current_integration and integration
      if (
        leadIntegrationTypesToUpdate?.FROM?.[
          IMPORTED_LEAD_SOURCE.GOOGLE_SHEET
        ] &&
        leadIntegrationTypesToUpdate?.TO?.[IMPORTED_LEAD_SOURCE.GOOGLE_SHEET]
      )
        promisestoResolve.push(
          Repository.update({
            tableName: DB_TABLES.LEAD,
            query: {
              // only leads belonging to this company
              company_id,
              integration_type:
                leadIntegrationTypesToUpdate?.FROM?.[
                  IMPORTED_LEAD_SOURCE.GOOGLE_SHEET
                ],
            },
            updateObject: {
              integration_type:
                leadIntegrationTypesToUpdate?.TO?.[
                  IMPORTED_LEAD_SOURCE.GOOGLE_SHEET
                ],
            },
            extras: { logging: console.log },
            t,
          })
        );
      else
        logger.info(
          `integration type for google_sheet not found for either current_integration or integration`
        );

      // if integration type for csv leads found for both current_integration and integration
      if (
        leadIntegrationTypesToUpdate?.FROM?.[IMPORTED_LEAD_SOURCE.CSV] &&
        leadIntegrationTypesToUpdate?.TO?.[IMPORTED_LEAD_SOURCE.CSV]
      )
        promisestoResolve.push(
          Repository.update({
            tableName: DB_TABLES.LEAD,
            query: {
              // only leads belonging to this company
              company_id,
              integration_type:
                leadIntegrationTypesToUpdate?.FROM?.[IMPORTED_LEAD_SOURCE.CSV],
            },
            updateObject: {
              integration_type:
                leadIntegrationTypesToUpdate?.TO?.[IMPORTED_LEAD_SOURCE.CSV],
            },
            extras: { logging: console.log },
            t,
          })
        );
      else
        logger.info(
          `integration type for csv not found for either current_integration or integration`
        );
    }
    // Resolve promises
    let resolvedPromises = await Promise.all(promisestoResolve);
    // looping through promises to ensure there were no errors
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
      console.log(data);
    }

    return [`Deleted and retained leads successfully`, null];
  } catch (err) {
    logger.error(`Error while deleting leads for integration change: `, err);
    return [null, err.message];
  }
};

/**
 * deletes all worflows for the company which are associated with integration(either from trigger or action)
 * create default workflow having trigger 'when_a_owner_changes' and action as 'stop_cadence'
 * */
const handleWorkflowsDeletion = async ({
  company_id,
  integration,
  option,
  t,
}) => {
  try {
    let promisesToDelete = [];
    let orQuery = {};
    // if option is equal to INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING then preserve workflows which are not integration dependent
    if (option === INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING) {
      let orQueryArray = [];
      orQueryArray.push({
        trigger: {
          [Op.in]: [
            WORKFLOW_TRIGGERS.WHEN_OWNERSHIP_CHANGES_IN_CADENCE,
            WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
            WORKFLOW_TRIGGERS.WHEN_A_LEAD_INTEGRATION_STATUS_IS_UPDATED,
            WORKFLOW_TRIGGERS.WHEN_A_ACCOUNT_INTEGRATION_STATUS_IS_UPDATED,
          ],
        },
      });
      orQueryArray.push(
        sequelize.where(
          sequelize.fn(
            'JSON_EXTRACT',
            sequelize.col('actions'),
            sequelize.literal(`"$.${WORKFLOW_ACTIONS.CHANGE_OWNER}"`)
          ),
          Op.not,
          null
        )
      );
      orQueryArray.push(
        sequelize.where(
          sequelize.fn(
            'JSON_EXTRACT',
            sequelize.col('actions'),
            sequelize.literal(
              `"$.${WORKFLOW_ACTIONS.CHANGE_INTEGRATION_STATUS}"`
            )
          ),
          Op.not,
          null
        )
      );
      orQuery = { [Op.or]: orQueryArray };
    }
    // delete all workflows belonging to the company which are associated with the integration
    promisesToDelete.push(
      Repository.destroy({
        tableName: DB_TABLES.WORKFLOW,
        query: {
          company_id,
          ...orQuery,
        },
        extras: {
          logging: console.log,
        },
        t,
      })
    );
    // delete all advanced workflows
    promisesToDelete.push(
      Repository.destroy({
        tableName: DB_TABLES.AUTOMATED_WORKFLOW,
        query: { company_id },
        extras: { logging: console.log },
        t,
      })
    );
    // resolve all promises
    const resolvedPromises = await Promise.all(promisesToDelete);
    // loop through resolvedPromises to check if any process failed
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
      console.log(`deleting workflows:`, data);
    }

    // if integration is not SHEETS then create a default workflow
    if (integration !== CRM_INTEGRATIONS.SHEETS) {
      // create default workflow having trigger 'when_a_owner_changes' and action as 'stop_cadence'
      const [createdWorkflow, errForCreatedWorkflow] = await Repository.create({
        tableName: DB_TABLES.WORKFLOW,
        createObject: {
          name: WORKFLOW_DEFAULT_NAMES[WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES],
          trigger: WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
          actions: {
            [WORKFLOW_ACTIONS.STOP_CADENCE]: '',
          },
          company_id,
        },
        t,
      });
      if (errForCreatedWorkflow) return [null, errForCreatedWorkflow];
    }

    return [`Deleted workflows successfully`, null];
  } catch (err) {
    logger.error(
      `Error while deleting workflows for integration change: `,
      err
    );
    return [null, err.message];
  }
};

/**
 * delete all cadences for company
 * create default cadences for company
 * */
const deleteCadences = async ({
  company_id,
  integration,
  super_admin_user_id,
  t,
}) => {
  try {
    // delete all cadences for company
    const [deleteCadences, errForDeleteCadences] = await Repository.destroy({
      tableName: DB_TABLES.CADENCE,
      query: {
        company_id,
      },
      t,
    });
    if (errForDeleteCadences) return [null, errForDeleteCadences];
    console.log(`deleteCadences: `, deleteCadences);

    // create default cadences for company
    const [createdMockCadences, errForCreatedMockCadences] =
      await createMockCadences({
        company_id,
        integration_type: integration,
        user_id: super_admin_user_id,
        t,
      });
    if (errForCreatedMockCadences) return [null, errForCreatedMockCadences];

    return [`Deleted cadences successfully`, null];
  } catch (err) {
    logger.error(`Error while deleting cadences for integration change: `, err);
    return [null, err.message];
  }
};

/**
 * deletes all settings of the company for all settings types
 * create company level settings with default values for all types
 * sets company level settings for all types for all users in settings table
 */
const handleSettingsDeletion = async ({ company_id, t }) => {
  try {
    // Variable declarations
    let settingsTypesTables = [
      DB_TABLES.AUTOMATED_TASK_SETTINGS,
      DB_TABLES.TASK_SETTINGS,
      DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS,
      DB_TABLES.BOUNCED_MAIL_SETTINGS,
      DB_TABLES.SKIP_SETTINGS,
      DB_TABLES.LEAD_SCORE_SETTINGS,
    ];

    /*
     * Step: deletes all settings of the company for all settings types
     * Step: create company level settings with default values for all types
     * Step: sets company level settings for all types for all users in settings table
     * */

    // Step: deletes all settings of the company for all settings types
    let promisesToDeleteUserAndSdExceptions = [];
    for (let settingsTypeTable of settingsTypesTables)
      promisesToDeleteUserAndSdExceptions.push(
        Repository.destroy({
          tableName: settingsTypeTable,
          query: {
            company_id,
          },
          t,
        })
      );
    // resolve all promises
    let resolvedPromisesToDeleteUserAndSdExceptions = await Promise.all(
      promisesToDeleteUserAndSdExceptions
    );
    // loop through all resolved promises to ensure all were successfull
    for (let resolvedPromiseToDeleteUserAndSdExceptions of resolvedPromisesToDeleteUserAndSdExceptions) {
      let [data, err] = resolvedPromiseToDeleteUserAndSdExceptions;
      if (err) return [null, err];
      console.log(data);
    }

    // Step: create company level settings with default values for all types
    // to store name of primary ids for all settings types tables, will be used later to determine what id to pick from created row for type of settings table
    let companyLevelSettingsPrimaryIdsName = {
      [DB_TABLES.AUTOMATED_TASK_SETTINGS]: 'at_settings_id',
      [DB_TABLES.TASK_SETTINGS]: 'task_settings_id',
      [DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS]: 'unsubscribe_settings_id',
      [DB_TABLES.BOUNCED_MAIL_SETTINGS]: 'bounced_settings_id',
      [DB_TABLES.SKIP_SETTINGS]: 'skip_settings_id',
      [DB_TABLES.LEAD_SCORE_SETTINGS]: 'ls_settings_id',
    };
    // stores ids for created rows for types of settings table
    // will contain data in the form of
    // {
    //  [settingsTypeTableName]: {
    //  [primary_id_name]: id_of_settings_row,
    //'at_settings_id': id_of_automated_mail_settings_company_level
    //  }
    // }
    // and later the value for [settingsTypeTableName] will be directly used to update in settings table for e.g. to set at_settings_id to id_of_automated_mail_settings_company_level in settings table
    let companyLevelSettingsQuery = {};

    // create default settings values
    // will be used later to create the settings with default values
    const automatedTaskSettings = {
      company_id,
      priority: SETTING_LEVELS.ADMIN,
      working_days: [1, 1, 1, 1, 1, 0, 0],
    };
    const taskSettings = {
      company_id,
      priority: SETTING_LEVELS.ADMIN,
      late_settings: {
        [NODE_TYPES.CALL]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.MESSAGE]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.MAIL]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_MESSAGE]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_PROFILE]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_INTERACT]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.LINKEDIN_CONNECTION]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.DATA_CHECK]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.CADENCE_CUSTOM]: 1 * 24 * 60 * 60 * 1000,
        [NODE_TYPES.WHATSAPP]: 1 * 24 * 60 * 60 * 1000,
      },
    };
    const unsubscribeMailSettings = {
      company_id,
      priority: SETTING_LEVELS.ADMIN,
      semi_automatic_unsubscribed_data: {
        automated_mail: true,
        mail: true,
        reply_to: true,
        automated_reply_to: true,
      },
      automatic_unsubscribed_data: {
        automated_mail: true,
        mail: true,
        reply_to: true,
        automated_reply_to: true,
      },
    };
    const bouncedMailSettings = {
      company_id,
      priority: SETTING_LEVELS.ADMIN,
      semi_automatic_bounced_data: {
        automated_mail: true,
        mail: true,
        reply_to: true,
        automated_reply_to: true,
      },
      automatic_bounced_data: {
        automated_mail: true,
        mail: true,
        reply_to: true,
        automated_reply_to: true,
      },
    };
    const skipSettings = {
      company_id,
      priority: SETTING_LEVELS.ADMIN,
    };
    const leadScoreSettings = {
      company_id,
      priority: SETTING_LEVELS.ADMIN,
    };
    const createValuesForSettingsTypesTable = {
      [DB_TABLES.AUTOMATED_TASK_SETTINGS]: automatedTaskSettings,
      [DB_TABLES.TASK_SETTINGS]: taskSettings,
      [DB_TABLES.UNSUBSCRIBE_MAIL_SETTINGS]: unsubscribeMailSettings,
      [DB_TABLES.BOUNCED_MAIL_SETTINGS]: bouncedMailSettings,
      [DB_TABLES.SKIP_SETTINGS]: skipSettings,
      [DB_TABLES.LEAD_SCORE_SETTINGS]: leadScoreSettings,
    };
    // promises to create settings types
    let promisesToCreateWithDefaultValues = [];
    // contains update object for settings table
    // will be of form
    // {
    // 'at_settings_id': at_settings_id_for_company_level,
    // 'task_settings_id': task_settings_id_for_company_level,
    // ...
    // }
    let settingsUpdateObject = {};
    // create admin level settings with above default values
    for (let settingsTypeTable of settingsTypesTables) {
      //console.log('------');
      //console.log(`settingsTypeTable: `, settingsTypeTable);
      //console.log(
      //`createValuesForSettingsTypesTable: `,
      //createValuesForSettingsTypesTable[settingsTypeTable]
      //);
      //console.log(
      //`companyLevelSettingsQuery: `,
      //companyLevelSettingsQuery[settingsTypeTable]
      //);
      //console.log('------');
      //if create value exists for this settings type table
      if (createValuesForSettingsTypesTable[settingsTypeTable])
        promisesToCreateWithDefaultValues.push(
          Repository.create({
            tableName: settingsTypeTable,
            createObject: createValuesForSettingsTypesTable[settingsTypeTable],
            t,
          })
        );
      // query used in above update updates in company level for that settings type using its primary column
      // since in settings table id for each settings type is stored, we store it in a object so later the object can be used as updateObject for settings
    }
    // resolve all promises
    let resolvedPromisesToCreateWithDefaultValues = await Promise.all(
      promisesToCreateWithDefaultValues
    );
    // looping through all resolved
    // use i so that you can know the table to which the promise belongs by using settingsTypesTables[i].
    // since promisesToCreateWithDefaultValues was formed by looping on settingsTypesTables, the order of tables in settingsTypesTables and promisesToCreateWithDefaultValues will be the same
    for (let i in resolvedPromisesToCreateWithDefaultValues) {
      // table name
      const tableName = settingsTypesTables[i];
      let [data, err] = resolvedPromisesToCreateWithDefaultValues[i];
      // if err found return
      if (err) return [null, err];
      // if no settings is found, it will be a error since company level setting should always exist
      if (!data) {
        logger.error(`Could not create company level setting for ${tableName}`);
        return [
          null,
          `Could not create company level setting for ${tableName}`,
        ];
      }
      //console.log(`tableName: `, tableName);
      //console.log(`data: `, data);

      // save query for the table using primary id
      // will be of form
      // {
      //  [tableName]: {
      //  [primary_id_name]: id_of_settings_row
      //  }
      // }
      // will be used in next line to store in settingsUpdateObject
      companyLevelSettingsQuery[tableName] = {
        [companyLevelSettingsPrimaryIdsName[tableName]]:
          data[companyLevelSettingsPrimaryIdsName[tableName]],
      };

      // store in settingsUpdateObject
      settingsUpdateObject = {
        ...settingsUpdateObject,
        ...companyLevelSettingsQuery[tableName],
      };
    }

    // Step: update all user's settings table to have default settings
    // manually add all priority columns in settings which needs to be updated to SETTING_LEVELS.ADMIN to the settingsUpdateObject
    settingsUpdateObject = {
      ...settingsUpdateObject,
      automated_task_setting_priority: SETTING_LEVELS.ADMIN,
      unsubscribe_setting_priority: SETTING_LEVELS.ADMIN,
      bounced_setting_priority: SETTING_LEVELS.ADMIN,
      skip_setting_priority: SETTING_LEVELS.ADMIN,
      ls_setting_priority: SETTING_LEVELS.ADMIN,
      task_setting_priority: SETTING_LEVELS.ADMIN,
    };
    console.log(`settingsUpdateObject: `, settingsUpdateObject);
    // preparing string for set statement from settingsUpdateObject
    // will be of form
    //`at_settings_id` = :at_settings_id,  `task_settings_id` = :task_settings_id,  `unsubscribe_settings_id` = :unsubscribe_settings_id,  `bounced_settings_id` = :bounced_settings_id,  `skip_settings_id` = :skip_settings_id,  `ls_settings_id` = :ls_settings_id,  `automated_task_setting_priority` = :automated_task_setting_priority,  `unsubscribe_setting_priority` = :unsubscribe_setting_priority,  `bounced_setting_priority` = :bounced_setting_priority,  `skip_setting_priority` = :skip_setting_priority,  `ls_setting_priority` = :ls_setting_priority,  `task_setting_priority` = :task_setting_priority
    let setStatementString = ``;
    Object.keys(settingsUpdateObject).map(
      (columnName, index, array) =>
        (setStatementString += ` \`${columnName}\` = :${columnName}${
          index !== array?.length - 1 ? ', ' : '' // add , only if it is not the last element
        }`)
    );
    console.log(`setStatementString: `, setStatementString);
    // raw query to update settings for all users belonging to company
    const queryToUpdateSettingsForCompanyUsers = `
update settings inner join user on settings.user_id=user.user_id set ${setStatementString} where user.company_id=:company_id
		`;
    console.log(
      `queryToUpdateSettingsForCompanyUsers: `,
      queryToUpdateSettingsForCompanyUsers
    );
    const [settingsUpdate, errForSettingsUpdate] =
      await Repository.runRawUpdateQuery({
        rawQuery: queryToUpdateSettingsForCompanyUsers,
        replacements: {
          company_id,
          ...settingsUpdateObject,
        },
        t,
      });
    if (errForSettingsUpdate) return [null, errForSettingsUpdate];

    return [`Deleted settings successfully`, null];
  } catch (err) {
    logger.error(`Error while deleting settings for integration change: `, err);
    return [null, err.message];
  }
};

/**
  changes integration for a company
  @param {string} company_id id of the company whose integration you want to change 
  @param {string} integration 
  new integration to which company should be updated
  enum to be used: CRM_INTEGRATIONS 
  @param {string} current_integration 
  current integration of the company
  enum to be used: CRM_INTEGRATIONS 
  @param {string} option 
  option to apply while changing integration
  enum to be used: INTEGRATION_CHANGE_OPTIONS
  @param {string} super_admin_user_id id of the super admin
  @param {string} super_admin_email email of the super admin
  @param t sequelize.transaction
 */
const handleDeleteForIntegrationChange = async ({
  company_id,
  option,
  integration,
  current_integration,
  super_admin_user_id,
  super_admin_email,
  t,
}) => {
  try {
    /*
     * Step: checks for function arguments
     *
     * Step: delete all things according to the options
     * things to be deleted
     * 1. leads(and all things related to leads) belonging to integration
     * 2. cadences
     * 3. workflows(standard(which are not related to integration) and advanced )
     * 4. settings
     *
     * things to create in case they are deleted
     * 1. settings(default settings which are created when a user is created)
     * 2. workflows(default worflows which are created when a company is created)
     * 3. cadences(default cadences which are created when a company is created)
     *
     * If option is
     * INTEGRATION_CHANGE_OPTIONS.START_FROM_SCRATCH -
     * Delete all things
     *
     * INTEGRATION_CHANGE_OPTIONS.KEEP_CADENCES_AND_SETTINGS -
     * delete leads and workflows
     *
     * INTEGRATION_CHANGE_OPTIONS.KEEP_EVERYTHING -
     * delete leads only
     *
     * in any option, leads belonging to the integration must be deleted
     * exception: for integrations CRM_INTEGRATIONS.GOOGLE_SHEETS and CRM_INTEGRATIONS.EXCEL no leads will be deleted
     *
     * */
    // Step: Checks for function arguments
    if (!Object.values(CRM_INTEGRATIONS).includes(integration))
      return [null, `Invalid value: ${integration} found for integration`];
    if (!Object.values(INTEGRATION_CHANGE_OPTIONS).includes(option))
      return [null, `Invalid value: ${option} found for option`];

    // Step: Variable declarations
    // all deletion processes will be stored in this array as promise and will be resolved in parallel
    let promisesToResolve = [];

    // Step: delete all things according to the options
    // no matter which option is selected, leads need to be deleted so we delete that without checking for the option
    promisesToResolve.push(
      handleLeadsDeletionAndRetention({
        company_id,
        option,
        integration,
        current_integration,
        t,
      })
    );

    // for testing
    //const [deletedSettings, errForDeletedSettings] =
    //await handleSettingsDeletion({
    //company_id,
    //integration,
    //t,
    //});
    //if (errForDeletedSettings) return [null, errForDeletedSettings];

    // for testing
    //const [deletedWorkflows, errForDeletedWorkflows] =
    //await handleWorkflowsDeletion({ company_id, t });
    //if (errForDeletedWorkflows) return [null, errForDeletedWorkflows];

    // for testing
    //const [deletedCadences, errForDeletedCadences] = await deleteCadences({
    //company_id,
    //integration,
    //super_admin_user_id,
    //t,
    //});
    //if (errForDeletedCadences) return [null, errForDeletedCadences];

    /*
 * OPTIONS: 
 *
  START_FROM_SCRATCH - delete  leads(all things related to leads), settings, cadences, workflow
  KEEP_CADENCES_AND_SETTINGS - delete leads(all things related to leads) and workflows
  KEEP_EVERYTHING - delete only leads(all things related to leads)
 *
 * */

    // handleWorkflowsDeletion handles workflow deletion based on option
    promisesToResolve.push(handleWorkflowsDeletion({ company_id, option, t }));
    //if (
    //[
    //INTEGRATION_CHANGE_OPTIONS.KEEP_CADENCES_AND_SETTINGS,
    //INTEGRATION_CHANGE_OPTIONS.START_FROM_SCRATCH,
    //].includes(option)
    //)
    //promisesToResolve.push(
    //handleWorkflowsDeletion({ company_id, option, t })
    //);

    // if option is  START_FROM_SCRATCH, then leads, settings,workflows and cadences were to be deleted
    // leads and workflows already deleted, delete settings and cadences
    if (option === INTEGRATION_CHANGE_OPTIONS.START_FROM_SCRATCH) {
      // delete settings
      promisesToResolve.push(
        handleSettingsDeletion({
          company_id,
          t,
        })
      );
      // delete cadences
      promisesToResolve.push(
        deleteCadences({
          company_id,
          integration,
          super_admin_user_id,
          t,
        })
      );
    }

    // resolve promises
    let resolvedPromises = await Promise.all(promisesToResolve);
    // looping through promises to check if any process failed
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
    }

    // all good, return successfully
    return [`Handled deletion for integration change successfully`, null];
  } catch (err) {
    logger.error(`Error while handling deletes for integration change: `, err);
    return [null, err.message];
  }
};

module.exports = handleDeleteForIntegrationChange;
