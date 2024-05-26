// Utils
const logger = require('../utils/winston');
const {
  DB_MODELS,
  DB_TABLES,
} = require('../../../Cadence-Brain/src/utils/modelEnums');

// Models
const { sequelize, User, Lead, Cadence } = require('../db/models');

// Packages
const { QueryTypes, Op } = require('sequelize');

// Helpers and services
const JsonHelper = require('../helper/json');
const SequelizeHelper = require('../helper/sequelize');
const { WORKFLOW_TRIGGERS } = require('../utils/enums');

const create = async ({ tableName, createObject, extras, t }) => {
  try {
    const modelName = DB_MODELS[tableName];
    const createdObject = await modelName.create(createObject, {
      transaction: t,
      ...extras,
    });

    return [JsonHelper.parse(createdObject), null];
  } catch (err) {
    if (err?.errors?.[0]?.message) {
      let msg = err.errors[0].message;
      logger.error(`Error while creating ${tableName}: ${msg}`);
      return [null, msg];
    }
    logger.error(`Error while creating ${tableName}: `, err);
    return [null, err.message];
  }
};

const bulkCreate = async ({ tableName, createObject, extras, t }) => {
  try {
    const modelName = DB_MODELS[tableName];
    const createdObjects = await modelName.bulkCreate(createObject, {
      transaction: t,
      ...extras,
    });
    return [JsonHelper.parse(createdObjects), null];
  } catch (err) {
    console.log(err?.errors);
    if (err?.errors?.[0]?.message) {
      let msg = err.errors[0].message;
      logger.error(`Error while creating ${tableName}(bulk): ${msg}`);
      return [null, msg];
    }
    logger.error(`Error while creating ${tableName}(bulk): `, err);
    return [null, err.message];
  }
};

const fetchOne = async ({ tableName, query, include = [], extras, t }) => {
  try {
    const modelName = DB_MODELS[tableName];

    let errForInclude = '';

    [include, errForInclude] = SequelizeHelper.getIncludeArray(include);

    if (errForInclude) return [null, errForInclude];
    const data = await modelName.findOne({
      where: query,
      include,
      ...extras,
      transaction: t,
    });

    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while fetching ${tableName}: `, err);
    return [null, err.message];
  }
};

const fetchAll = async ({ tableName, query, include = [], extras, t }) => {
  try {
    const modelName = DB_MODELS[tableName];

    let errForInclude = '';

    [include, errForInclude] = SequelizeHelper.getIncludeArray(include);

    if (errForInclude) return [null, errForInclude];

    const data = await modelName.findAll({
      where: query,
      include,
      ...extras,
      transaction: t,
    });

    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while fetching ${tableName}(All): `, err);
    return [null, err.message];
  }
};

const update = async ({ tableName, updateObject, query, extras, t }) => {
  try {
    const modelName = DB_MODELS[tableName];
    //console.log({ updateObject, query });
    const data = await modelName.update(updateObject, {
      where: query,
      transaction: t,
      ...extras,
    });

    return [JsonHelper.parse(data), null];
  } catch (err) {
    if (err?.errors?.[0]?.message) {
      let msg = err.errors[0].message;
      logger.error(`Error while updating ${tableName}: ${msg}`);
      return [null, msg];
    }
    logger.error(`Error while updating ${tableName}: `, err);
    return [null, err.message];
  }
};

const upsert = async ({ tableName, upsertObject, extras, t }) => {
  try {
    const modelName = DB_MODELS[tableName];
    const upsertedObject = await modelName.upsert(upsertObject, {
      where: upsertObject,
      transaction: t,
      ...extras,
    });

    return [JsonHelper.parse(upsertedObject), null];
  } catch (err) {
    if (err?.errors?.[0]?.message) {
      let msg = err.errors[0].message;
      logger.error(`Error while upserting ${tableName}: ${msg}`);
      return [null, msg];
    }
    logger.error(`Error while upserting ${tableName}: `, err);
    return [null, err.message];
  }
};

const destroy = async ({ tableName, query, extras = {}, t }) => {
  try {
    const modelName = DB_MODELS[tableName];
    const data = await modelName.destroy({
      where: query,
      transaction: t,
      ...extras,
    });

    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while deleting ${tableName}: `, err);
    return [null, err.message];
  }
};

const count = async ({ tableName, query, include = [], extras, t }) => {
  try {
    const modelName = DB_MODELS[tableName];

    let errForInclude = '';

    [include, errForInclude] = SequelizeHelper.getIncludeArray(include);

    if (errForInclude) return [null, errForInclude];

    const data = await modelName.count({
      where: query,
      include,
      ...extras,
      transaction: t,
    });

    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while fetching count for ${tableName}: `, err);
    return [null, err.message];
  }
};
/**
 * @param {string} rawQuery - raw sql query
 * @param {sequelize.model} tableName - your base table for the raw query( should be a value from DB_MODELS )
 * @param {Object} include - json for the structure of your joins in the query (will be identical to sequelize format for include but will only contain model names)
 * @param {string} replacements - object for params you have passed in your rawQuery
 * @param {string} hasJoin - true if your query has a join else false ( default true )
 * @param {Object} extras - anything extra you want to pass other than function arguments
 * */

const runRawQuery = async ({
  rawQuery,
  tableName,
  include = [],
  replacements,
  hasJoin = true,
  extras = {},
  t,
}) => {
  const options = {
    include,
  };
  try {
    tableName._validateIncludedElements(options);
    let result = await sequelize.query(rawQuery, {
      raw: false,
      nest: true,
      replacements,
      model: tableName,
      hasJoin,
      mapToModel: true,
      transaction: t,
      ...options,
      ...extras,
    });
    return [result, null];
  } catch (err) {
    logger.error(`Error while executing raw query: `, err);
    return [null, err.message];
  }
};

const runRawUpdateQuery = async ({
  rawQuery,
  replacements = {},
  t = null,
  extras = {},
}) => {
  try {
    let result = await sequelize.query(rawQuery, {
      type: QueryTypes.UPDATE,
      replacements,
      returning: true,
      transaction: t,
      ...extras,
    });
    // TODO: remove once feature is stable
    console.log(`result for update: `, result);
    return [result, null];
  } catch (err) {
    logger.error(`Error while running raw update query `, err);
    return [null, err.message];
  }
};

const runRawDeleteQuery = async ({ rawQuery, replacements = {}, t = null }) => {
  try {
    let result = await sequelize.query(rawQuery, {
      type: QueryTypes.DELETE,
      replacements,
      returning: true,
      transaction: t,
    });
    logger.info(`Ran delete raw query successfully`);
    return [result, null];
  } catch (err) {
    logger.error(`Error while running raw delete query `, err);
    return [null, err.message];
  }
};

//(async function test() {
//let t = await sequelize.transaction();
//const data = await fetchAll({
//tableName: DB_TABLES.WORKFLOW,
//query: {
//company_id: '0fc08e9a-eba5-4ebe-8151-42c52a440146',
//[Op.or]: [
//{
//trigger: {
//[Op.in]: [
//WORKFLOW_TRIGGERS.WHEN_OWNERSHIP_CHANGES_IN_CADENCE,
//WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES,
//WORKFLOW_TRIGGERS.WHEN_A_LEAD_INTEGRATION_STATUS_IS_UPDATED,
//WORKFLOW_TRIGGERS.WHEN_A_ACCOUNT_INTEGRATION_STATUS_IS_UPDATED,
//],
//},
//},
//sequelize.where(
//sequelize.fn(
//'JSON_EXTRACT',
//sequelize.col('actions'),
//sequelize.literal('"$.when_a_owner_changes"')
//),
//Op.not,
//null
//),
//sequelize.where(
//sequelize.fn(
//'JSON_EXTRACT',
//sequelize.col('actions'),
//sequelize.literal('"$.change_integration_status"')
//),
//Op.not,
//null
//),
//],
//},
//extras: {
//logging: console.log,
//},
//t,
//});

//console.log(data);
//try {
////throw new Error('ainvayi');
//await t.commit();
//} catch (err) {
//console.log(err);
//await t.rollback();
//}
//})();

const Repository = {
  create,
  bulkCreate,
  fetchOne,
  fetchAll,
  update,
  upsert,
  destroy,
  count,
  runRawQuery,
  runRawUpdateQuery,
  runRawDeleteQuery,
};

module.exports = Repository;
