require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

// Utils
const logger = require('./winston');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Db
const dbModels = require('../db/models');

const MODEL_ENUMS_FILE_NAME = 'modelEnums.js';

const MODEL_ENUMS_FILE_PATH = path.resolve(__dirname, MODEL_ENUMS_FILE_NAME);

// Delete unwanted data from dbModels
delete dbModels.sequelize;
delete dbModels.Sequelize;

let DB_TABLES = {};

let DB_MODELS = {};

let all_models = [];

let contentForFile = ``;

Object.keys(dbModels).map((model_name) => {
  DB_TABLES[model_name.toUpperCase()] = model_name.toLowerCase();
  DB_MODELS[model_name.toLowerCase()] = model_name;
  all_models.push(model_name);
});

//console.log(`DB_TABLES: `, DB_TABLES);

//console.log(`DB_MODELS: `, DB_MODELS);

const dbModelsRequireStatement = `const { ${all_models.join(
  ','
)} } = require("../db/models")`;

//console.log(all_models.join(','));

contentForFile =
  dbModelsRequireStatement +
  '\n\n' +
  `const DB_TABLES = ${JSON.stringify(DB_TABLES)}` +
  '\n\n';

contentForFile += `const DB_MODELS = {\n`;

//contentForFile =
//dbModelsRequireStatement +
//`\n` +
//`const DB_TABLES = ${JSON.stringify(DB_TABLES)}` +
//`\n` +
//`const DB_MODELS = ${JSON.stringify(DB_MODELS)}` +
//`\n` +
//`module.exports = { DB_TABLES,DB_MODELS }`;

Object.keys(DB_MODELS).map(
  (key) => (contentForFile += `"${key}": ${DB_MODELS[key]},\n`)
);

contentForFile += `}` + '\n\n';

contentForFile += `module.exports = { DB_TABLES,DB_MODELS }`;

console.log(contentForFile);

if (fs.existsSync(MODEL_ENUMS_FILE_PATH)) {
  logger.info(`Deleting ${MODEL_ENUMS_FILE_PATH}`);
  fs.unlinkSync(MODEL_ENUMS_FILE_PATH);
}

fs.appendFileSync(MODEL_ENUMS_FILE_PATH, contentForFile);

logger.info(`Content written.`);
logger.info(`Applying prettier...`);

let MODEL_ENUMS_FILE_ESCAPED_PATH = MODEL_ENUMS_FILE_PATH.replace(/ /g, '\\ ');

exec(
  `npx prettier --write ${MODEL_ENUMS_FILE_ESCAPED_PATH}`,
  (err, stdout, stderr) => {
    if (err)
      logger.error(
        `Error occured while generating ${MODEL_ENUMS_FILE_ESCAPED_PATH}: `,
        err
      );
    console.log(`STDOUT: `, stdout);
    console.log(`STDERR: `, stderr);
  }
);
