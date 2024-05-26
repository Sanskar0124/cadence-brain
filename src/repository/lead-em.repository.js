// Utils
const logger = require('../utils/winston');

// Models
const { Lead_email, Lead } = require('../db/models');

// Helpers and services
const JsonHelper = require('../helper/json');

// * bulk create lead_email rows by lead_id with first email as primary
const createLeadEmails = async (emails, lead_id) => {
  try {
    let emailList = [];
    for (let email of emails) {
      let obj = {};
      obj.email_id = email;
      obj.lead_id = lead_id;
      emailList.push(obj);
    }
    emailList[0].is_primary = true;
    const createdEmails = await Lead_email.bulkCreate(emailList);
    return [JsonHelper.parse(createdEmails), null];
  } catch (err) {
    logger.error(`Error while creating lead emails: ${err.message}.`);
    return [null, err.message];
  }
};

// * create lead email row by lead_id with non primary email unless specified otherwise
const createAdditionalEmail = async (email_id, lead_id, is_primary = false) => {
  try {
    let emailObj = {
      email_id,
      lead_id,
      is_primary,
    };
    const createdEmail = await Lead_email.create(emailObj);
    return [JsonHelper.parse(createdEmail), null];
  } catch (err) {
    logger.error(`Error while adding lead email: ${err.message}.`);
    return [null, err.message];
  }
};

// * fetch lead_email rows by query
const fetchLeadEmailByQuery = async (query) => {
  try {
    const emails = await Lead_email.findAll({
      where: query,
    });
    return [JsonHelper.parse(emails), null];
  } catch (err) {
    logger.error(`Error while fetching lead emails by query: ${err.message}.`);
    return [null, err.message];
  }
};

// * fetch leads by email_id
const fetchLeadsByLeadEmailQuery = async (query) => {
  try {
    const leads = await Lead_email.findAll({
      where: query,
      include: Lead,
    });
    return [JsonHelper.parse(leads), null];
  } catch (err) {
    logger.error(
      `Error while fetching leads by lead email query: ${err.message}.`
    );
    return [null, err.message];
  }
};

// * update lead email row by query
const updateLeadEmail = async (query, body) => {
  try {
    const data = await Lead_email.update(body, {
      where: query,
    });
    return [JsonHelper.parse(data), null];
  } catch (err) {
    logger.error(`Error while updating lead emails by query: ${err.message}.`);
    return [null, err.message];
  }
};

// * delete lead_email rows by query
const deleteLeadEmail = async (query) => {
  try {
    const emails = await Lead_email.destroy({
      where: query,
    });
    return [JsonHelper.parse(emails), null];
  } catch (err) {
    logger.error(`Error while deleting lead emails by query: ${err.message}.`);
    return [null, err.message];
  }
};

const fetchLeadEmailByLeadQuery = async (lead_email_query, lead_query) => {
  try {
    const emails = await Lead_email.findAll({
      where: lead_email_query,
      include: [
        {
          model: Lead,
          where: lead_query,
        },
      ],
    });
    return [JsonHelper.parse(emails), null];
  } catch (err) {
    logger.error(
      `Error while fetching lead emails by lead query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const LeadEmailRepository = {
  createLeadEmails,
  createAdditionalEmail,
  fetchLeadEmailByQuery,
  fetchLeadsByLeadEmailQuery,
  updateLeadEmail,
  deleteLeadEmail,
  fetchLeadEmailByLeadQuery,
};

module.exports = LeadEmailRepository;
