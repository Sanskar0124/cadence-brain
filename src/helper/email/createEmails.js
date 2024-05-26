// * Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// * Repositories
const Repository = require('../../repository');

// * Helpers
const JsonHelper = require('../json');

// * Models
const { Lead_email } = require('../../db/models');

const createEmails = async (emails, lead_id) => {
  try {
    let emailList = [];
    let flag = 0;

    for (let emailObj of emails) {
      let obj = emailObj;
      if (obj.email_id == undefined || obj.email_id === '') obj.email_id = '';
      else if (flag === 0) {
        obj.is_primary = true;
        flag = 1;
      }
      obj.lead_id = lead_id;
      emailList.push(obj);
    }

    // If none of the emails are valid, setting the first as primary
    if (flag === 0) emailList[0].is_primary = true;

    const createdEmails = await Lead_email.bulkCreate(emailList);
    return [JsonHelper.parse(createdEmails), null];
  } catch (err) {
    logger.error(`Error while creating emails: `, err);
    return [null, err.message];
  }
};

const createEmailUsingType = async (email_id, lead_id, type) => {
  try {
    const createdEmail = await Repository.create({
      tableName: [DB_TABLES.LEAD_EMAIL],
      createObject: {
        email_id,
        type,
        lead_id,
      },
    });
    return [createdEmail, null];
  } catch (err) {
    logger.error(`Error while creating email: `, err);
    return [null, err.message];
  }
};

module.exports = {
  createEmails,
  createEmailUsingType,
};
