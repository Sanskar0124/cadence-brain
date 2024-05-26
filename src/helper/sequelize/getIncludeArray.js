// Utils
const logger = require('../../utils/winston');
const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');

// const LeadRepository = require('../../repository/lead.repository');

//const DB_TABLES = {
//ACCOUNT: 'account',
//USER: 'user',
//LEAD_EMAIL: 'lead_email',
//LEAD: 'lead',
//SUB_DEPARTMENT: 'sub_department',
//};

//const DB_MODELS = {
//account: Account,
//user: User,
//lead_email: Lead_email,
//lead: Lead,
//sub_department: Sub_Department,
//};

/*
 * Should receive inputObject as {} with key as Model you want to include and Value as an {}  with whatever you want to pass it with sequelize
 * */
const getIncludeObject = (inputObject) => {
  try {
    let includeObject = {};
    const dbModels = Object.values(DB_TABLES);
    const inputObjectKeys = Object.keys(inputObject);

    if (inputObjectKeys.length !== 1) {
      logger.error(`Input object must contain only model as key.`);
      return [null, `Input object must contain only model as key.`];
    }

    const inputObjectKey = inputObjectKeys[0];
    //console.log(`model: `, inputObjectKeys[0]);

    // Only if key is a model
    if (dbModels.includes(inputObjectKey)) {
      //console.log(`Calculating for ${inputObjectKey}`);
      includeObject.model = DB_MODELS[inputObjectKey];
      //includeObject.include = [];
      //console.log(includeObject);
      Object.keys(inputObject[inputObjectKey]).map((key) => {
        if (dbModels.includes(key)) {
          const [value, err] = getIncludeObject({
            [key]: inputObject[inputObjectKey][key],
          });
          if (err) return [null, err];
          if (value) {
            if (includeObject.include) includeObject.include.push(value);
            else includeObject.include = [value];
          }
        } else includeObject[key] = inputObject[inputObjectKey][key];
        //console.log(includeObject);
      });
    } else {
      logger.error(`Input object key should be a db model.`);
      return [null, `Input object key should be a db model.`];
    }
    return [includeObject, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while calculating include object: `, err);
    return [null, `Error while calculating include object: ${err.message}`];
  }
};

const getIncludeArray = (includeObject) => {
  try {
    let include = [];

    Object.keys(includeObject).map((includeObjectKey) => {
      //console.log(includeObjectKey);
      const [value, err] = getIncludeObject({
        [includeObjectKey]: includeObject[includeObjectKey],
      });
      if (err) return [null, err];
      if (value) include.push(value);
    });

    return [include, null];
  } catch (err) {
    logger.error(`Error while calculating include array: `, err);
    return [null, err.message];
  }
};

//console.log([DB_TABLES.ACCOUNT]);

// let attributes = {
//   [DB_TABLES.ACCOUNT]: {
//     attributes: ['account_id'],
//   },
//   [DB_TABLES.LEAD_EMAIL]: {
//     attributes: ['lem_id', 'is_primary'],
//     where: {
//       is_primary: 1,
//     },
//     required: false,
//     //limit: 1,
//   },
//   [DB_TABLES.USER]: {
//     attributes: ['user_id'],
//     [DB_TABLES.SUB_DEPARTMENT]: {
//       attributes: ['sd_id'],
//     },
//   },
// };

// const include = getIncludeArray(attributes)[0];
// console.log(`MAIN INCLUDE: `, include);
// console.log(`sd include: `, include[2].include);

// LeadRepository.test({
//   include,
//   query: {
//     user_id: '1',
//     //lead_id: '17170',
//   },
//   extras: { limit: 1, logging: console.log },
// });

module.exports = getIncludeArray;
