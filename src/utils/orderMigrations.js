// to load env, to use models
require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

// Utils
const logger = require('./winston');

// Packages
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../db/models');
//const { query } = require('sequelize');

const orderMigrations = async () => {
  try {
    // indicates what the correct number should be for a file
    let migrationNumber = 1;

    // read existing migrations
    const existingFiles = fs.readdirSync(
      path.join(__dirname, '../db/migrations')
    );
    let fileNamesMap = {};
    const queryResult = await sequelize.query(`select * from SequelizeMeta;`);
    for (let file of existingFiles) {
      const fileNameSplit = file?.split('-');
      const fileMigrationNumber = parseInt(fileNameSplit?.[1]);
      console.log('\n');
      console.log(
        `File name: ${file}, fileMigrationNumber: ${fileMigrationNumber}.`
      );
      if (migrationNumber !== fileMigrationNumber) {
        //console.log(`Incorrect name.`);
        const correctName =
          fileNameSplit[0] +
          `-${migrationNumber}-` +
          fileNameSplit.slice(2).join('-');
        console.log(`New Name: ${correctName}.`);
        console.log(`Renaming ${file} to ${correctName}.`);
        fileNamesMap[file] = correctName;

        const updateQuery = `update SequelizeMeta set name='${correctName}' where name='${file}';`;
        console.log(`Updating...`);
        const result = await sequelize.query(updateQuery);
        console.log(`Updated`);
        //console.log(result);
        console.log(`Query: ${updateQuery}.`);

        // rename the file
        fs.renameSync(
          path.join(__dirname, `../db/migrations/${file}`),
          path.join(__dirname, `../db/migrations/${correctName}`)
        );
      } else {
        //console.log(`Correct name.`);
        fileNamesMap[file] = file;
      }
      migrationNumber++;
      console.log('\n');
    }
    console.log(`${existingFiles.length} Files found.`);
    //console.log(JSON.stringify(fileNamesMap, null, 4));
    console.log(`Ordered migrations.`);
    return [`Ordered migrations.`, null];
  } catch (err) {
    logger.error('Error while ordering migrations: ', err);
    return [null, err.message];
  }
};

orderMigrations();
