// Utils
const logger = require('../../utils/winston');
const { CRM_INTEGRATIONS } = require('../../utils/enums');
const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');

// Packages
const { QueryTypes } = require('sequelize');

// Repository
const Repository = require('../../repository');

/**
  deletes integration tokens for all users belonging to a company depending on current_integration
  creates new integration tokens for all users belonging to a company depending on integration
  @param {string} company_id id of the company whose integration you want to change 
  @param {string} integration 
  new integration to which company should be updated
  enum to be used: CRM_INTEGRATIONS 
  @param {string} current_integration 
  current integration of the company
  enum to be used: CRM_INTEGRATIONS 
  @param t sequelize.transaction
 */
const handleIntegrationTokensForIntegrationChange = async ({
  company_id,
  integration,
  current_integration,
  t,
}) => {
  try {
    // Step: declare variables
    let tokensForCompanyIntegrationType = {
      [CRM_INTEGRATIONS.SALESFORCE]: DB_TABLES.SALESFORCE_TOKENS,
      [CRM_INTEGRATIONS.PIPEDRIVE]: DB_TABLES.PIPEDRIVE_TOKENS,
      [CRM_INTEGRATIONS.HUBSPOT]: DB_TABLES.HUBSPOT_TOKENS,
      [CRM_INTEGRATIONS.ZOHO]: DB_TABLES.ZOHO_TOKENS,
      [CRM_INTEGRATIONS.SELLSY]: DB_TABLES.SELLSY_TOKENS,
      [CRM_INTEGRATIONS.BULLHORN]: DB_TABLES.BULLHORN_TOKENS,
      [CRM_INTEGRATIONS.DYNAMICS]: DB_TABLES.DYNAMICS_TOKENS,
    };
    let tokensTableToDelete =
      tokensForCompanyIntegrationType[current_integration];
    let tokensTableToCreate = tokensForCompanyIntegrationType[integration];
    console.log({ tokensTableToCreate, tokensTableToDelete });
    let promisesToResolve = [];
    // Step: deletes integration tokens for all users belonging to a company depending on current_integration
    // query to delete tokens for all users belonging to a company
    // since some integrations may not have tokens table for e.g.google sheets and excel, there is no table to delete from
    if (tokensTableToDelete) {
      let deleteQuery = `delete \`${tokensTableToDelete}\` from \`${tokensTableToDelete}\` inner join \`user\` on \`${tokensTableToDelete}\`.user_id=\`user\`.user_id where \`user\`.company_id='${company_id}'`;
      console.log(`deleteQuery: `, deleteQuery);

      // delete using rawQuery
      promisesToResolve.push(
        Repository.runRawDeleteQuery({
          rawQuery: deleteQuery,
          t,
        })
      );
    }
    // Step: creates new integration tokens for all users belonging to a company depending on integration
    // query to create new tokens for all users belonging to a company
    // since some integrations may not have tokens table for e.g.google sheets and excel, there is no table to create into
    if (tokensTableToCreate) {
      let createQuery = `
    insert into \`${tokensTableToCreate}\`(user_id,created_at,updated_at)
    select user_id,now(),now() from \`user\` where company_id = :company_id
    `;
      console.log(`createQuery: `, createQuery);
      // create using rawQuery
      promisesToResolve.push(
        Repository.runRawQuery({
          tableName: DB_MODELS[tokensTableToCreate],
          rawQuery: createQuery,
          extras: {
            type: QueryTypes.INSERT,
            returning: true,
          },
          replacements: {
            company_id,
          },
          include: [],
          t,
        })
      );
    }
    // resolve promises
    let resolvedPromises = await Promise.all(promisesToResolve);
    // looping through resolvedPromises to check if any error occured for any process
    for (let resolvedPromise of resolvedPromises) {
      // destructure data,err
      const [data, err] = resolvedPromise;
      if (err) return [null, err];
      console.log(data);
    }
    return [`Handled integration tokens for integration change`, null];
  } catch (err) {
    logger.error(
      `Error while handling integration tokens for integration change: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = handleIntegrationTokensForIntegrationChange;
