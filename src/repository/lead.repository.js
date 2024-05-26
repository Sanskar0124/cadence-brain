// Utils
const logger = require('../utils/winston');
const {
  LEAD_STATUS,
  LEAD_TYPE,
  NODE_TYPES,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  CUSTOM_TASK_NODE_ID,
} = require('../utils/enums');
const { TIME_DIFF_FOR_NEW_LEAD } = require('../utils/constants');

// Models
const { Op } = require('sequelize');
const {
  Lead,
  sequelize,
  Sequelize,
  Company,
  Company_Settings,
  Status,
  Account,
  Activity,
  Lead_phone_number,
  Cadence,
  Task,
  Node,
  LeadToCadence,
  User,
  Lead_email,
  User_Token,
} = require('../db/models');

// Repositories
const AccountRepository = require('./account.repository');
const LeadPhoneNumberRepository = require('./lead-pn.repository');
const LeadEmailRepository = require('./lead-em.repository');
const LeadToCadenceRepository = require('./lead-to-cadence.repository');
const StatusRepository = require('./status.repository');

// Helpers and services
const MetricsHelper = require('../helper/employee/metrics.helper');
//Removed Circular Dependency  01) ..\..\Cadence-Brain\src\helper\email\index.js -> ..\..\Cadence-Brain\src\helper\email\checkDuplicates.js -> ..\..\Cadence-Brain\src\repository\lead.repository.js -> ..\..\Cadence-Brain\src\helper\lead\index.js -> ..\..\Cadence-Brain\src\helper\lead\createLead.js
//const LeadHelper = require('../helper/lead');
const hasLeadUnsubscribed = require('../helper/lead/hasLeadUnsubscribed.js');
const JsonHelper = require('../helper/json');

const createUnassignedLead = async (lead, user_id) => {
  try {
    logger.info('Creating lead..');
    if (!Array.isArray(lead.phone_number))
      return [null, 'Phone number should be an array.'];

    //Find account if present or creating new account
    const [account_id, errForAccount] =
      await AccountRepository.findOrCreateAccount({
        name: lead.companyName,
        size: lead.companySize,
        url: lead.companyUrl ?? '',
        country: lead.country,
        zip_code: lead.zipcode,
        salesforce_account_id: lead.salesforce_account_id,
      });
    if (errForAccount) return [null, 'Error while creating account.'];

    // Creating lead
    const createdLead = await Lead.create({
      type: lead.type,
      status: lead.status,
      first_name: lead.first_name,
      last_name: lead.last_name,
      full_name: lead.first_name + ' ' + lead.last_name,
      first_path: lead.first_path,
      // email: lead.email, //  Remove email from lead
      phone_number: lead.phone_number.join(','),
      verified: false,
      source_site: lead.source_site,
      job_position: lead.job_position,
      account_id: account_id,
      user_id: user_id,
      status: LEAD_STATUS.NEW_LEAD,
      assigned_time: new Date(),
    });

    //Creating lead phone numbers
    const [_, errForNumbers] =
      await LeadPhoneNumberRepository.createPhoneNumbers(
        lead.phone_number,
        createdLead.lead_id
      );
    if (errForNumbers)
      return [null, 'Error while creating lead phone numbers.'];

    // Creating lead emails
    let emails, errForEmails;

    if (lead.Email) {
      if (Array.isArray(lead.Email)) {
        [emails, errForEmails] = await LeadEmailRepository.createLeadEmails(
          lead.Email,
          createdLead.lead_id
        );
        if (errForEmails) return [null, 'Error while creating lead emails.'];
      } else {
        [emails, errForEmails] =
          await LeadEmailRepository.createAdditionalEmail(
            lead.Email,
            createdLead.lead_id,
            true
          );
        if (errForEmails) return [null, 'Error while creating lead emails.'];
      }
    }
    logger.info('Lead created successfully.');
    return [createdLead, null];
  } catch (err) {
    logger.error(err.message);
    if (err.errors[0].message.includes('must be unique'))
      return [null, err.errors[0].message];
    return [null, err.message];
  }
};

const createAndAssignLead = async (lead, cadence) => {
  try {
    logger.info('Creating lead..');
    if (!Array.isArray(lead.phone_number))
      return [null, 'Phone number should be an array.'];

    const [account_id, errForAccount] =
      await AccountRepository.findOrCreateAccount({
        name: lead.company_name,
        size: lead.company_size,
        url: lead.company_url ?? '',
        country: lead.company_country,
        zip_code: lead.company_zipcode,
        salesforce_account_id: lead.salesforce_account_id,
      });
    if (errForAccount) return [null, 'Error while creating account.'];

    const createdLead = await Lead.create({
      type: lead.type,
      status: lead.status,
      first_name: lead.first_name,
      last_name: lead.last_name,
      full_name: lead.first_name + ' ' + lead.last_name,
      first_path: lead.first_path,
      // email: lead.email,
      email_validity: 'valid',
      phone_number: lead.phone_number.join(','),
      verified: false,
      source_site: lead.source_site,
      job_position: lead.job_position,
      account_id: account_id,
      salesforce_lead_id: lead.salesforce_lead_id ?? null,
      salesforce_contact_id: lead.salesforce_contact_id ?? null,
      duplicate: lead.duplicate,
      user_id: lead.user_id,
      assigned_time: new Date(),
    });

    if (lead.phone_number.length !== 0) {
      //Creating lead phone numbers
      const [_, errForNumbers] =
        await LeadPhoneNumberRepository.createPhoneNumbers(
          lead.phone_number,
          createdLead.lead_id
        );
      if (errForNumbers)
        return [null, 'Error while creating lead phone numbers.'];
    }

    // Creating lead emails
    let emails, errForEmails;

    if (lead.Email) {
      if (Array.isArray(lead.Email)) {
        [emails, errForEmails] = await LeadEmailRepository.createLeadEmails(
          lead.Email,
          createdLead.lead_id
        );
        if (errForEmails) return [null, 'Error while creating lead emails.'];
      } else {
        [emails, errForEmails] =
          await LeadEmailRepository.createAdditionalEmail(
            lead.Email,
            createdLead.lead_id,
            true
          );
        if (errForEmails) return [null, 'Error while creating lead emails.'];
      }
    }

    let [unsubscribed, ___] = await hasLeadUnsubscribed(
      createdLead.lead_id
    );
    const [createdLink, errForLink] =
      await LeadToCadenceRepository.createLeadToCadenceLink({
        lead_id: createdLead.lead_id,
        cadence_id: cadence?.cadence_id,
        status:
          cadence?.status === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        unsubscribed: unsubscribed ?? false,
      });
    if (errForLink) return [null, 'Error while creating lead to cadence link.'];

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully.', createdLead.lead_id);
    return [createdLead, null];
  } catch (err) {
    logger.error(err.message);
    if (err.errors[0].message.includes('must be unique'))
      return [null, err.errors[0].message];
    return [null, err.message];
  }
};

const createAndAssignLeadFromSalesforce = async (lead) => {
  try {
    logger.info('Creating lead..');

    // Phone number validation done in controller

    const [account_id, errForAccount] =
      await AccountRepository.findOrCreateAccount({
        name: lead.Company,
        size: lead.Effectif_Linkedin__c,
        url: lead.Website ?? null,
        country: lead.Country,
        zip_code: lead.PostalCode,
      });
    if (errForAccount) return [null, 'Error while creating account.'];

    const createdLead = await Lead.create({
      type: LEAD_TYPE.HEADER_FORM,
      status: LEAD_STATUS.NEW_LEAD,
      first_name: lead.FirstName,
      last_name: lead.LastName,
      full_name: lead.FirstName + ' ' + lead.LastName,
      linkedin_url: lead.Linkedin__c,
      verified: false,
      source_site: lead.Source_site__c,
      job_position: lead.Title,
      account_id: account_id,
      salesforce_lead_id: lead.salesforce_lead_id,
      duplicate: lead.duplicate,
      user_id: lead.user_id,
      assigned_time: new Date(),
    });

    //Creating lead phone numbers
    const [_, errForNumbers] =
      await LeadPhoneNumberRepository.createPhoneNumbers(
        lead.phone_number,
        createdLead.lead_id
      );
    if (errForNumbers)
      return [null, 'Error while creating lead phone numbers.'];

    // Creating lead emails
    let emails, errForEmails;
    if (lead.emails) {
      [emails, errForEmails] = await LeadEmailRepository.createLeadEmails(
        lead.emails,
        createdLead.lead_id
      );
      if (errForEmails) return [null, 'Error while creating lead emails.'];
    }
    let [unsubscribed, ___] = await hasLeadUnsubscribed(
      createdLead.lead_id
    );

    // Creating lead to cadence link
    const [createdLink, errForLink] =
      await LeadToCadenceRepository.createLeadToCadenceLink({
        lead_id: createdLead.lead_id,
        cadence_id: lead.cadence_id,
        status:
          lead.cadenceStatus === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        lead_cadence_order: lead.leadCadenceOrder,
        unsubscribed: unsubscribed ?? false,
      });
    if (errForLink) return [null, 'Error while creating lead to cadence link.'];

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + createdLead.lead_id);

    const [status, errForStatus] = await StatusRepository.createStatus({
      lead_id: createdLead.lead_id,
      message: 'Created new lead',
      status: LEAD_STATUS.NEW_LEAD,
    });

    if (errForStatus)
      return [null, `Error while creating status: ${errForStatus}.`];

    logger.info(`Lead status entry created.`);
    return [createdLead, null];
  } catch (err) {
    logger.error(`Error while creating lead from salesforce: ${err.message}`);
    if (err.errors[0].message.includes('must be unique'))
      return [null, err.errors[0].message];
    return [null, err.message];
  }
};

const createAndAssignContactFromSalesforce = async (lead) => {
  try {
    logger.info('Creating lead..');

    // Phone number validation done in controller

    const [account_id, errForAccount] =
      await AccountRepository.findOrCreateAccount({
        name: lead.Account.Name,
        size: lead.Account.Effectif__c,
        url: lead.Account.Website ?? null,
        country: lead.Account.BillingCountry,
        zip_code: lead.Account.BillingPostalCode,
        linkedin_url:
          lead.Account.Linkedin_Societe__c ?? lead.Account.Linkedin_Address__c,
        phone_number: lead.Account.Phone,
        salesforce_account_id: lead.Account.salesforce_account_id ?? null,
        user_id: lead.user_id,
      });
    if (errForAccount) return [null, 'Error while creating account.'];

    const createdLead = await Lead.create({
      type: LEAD_TYPE.HEADER_FORM,
      status: LEAD_STATUS.NEW_LEAD,
      first_name: lead.FirstName,
      last_name: lead.LastName,
      full_name: lead.FirstName + ' ' + lead.LastName,
      linkedin_url: lead.URL_Profil_Linkedin__c,
      verified: false,
      source_site: lead.Source_site__c,
      job_position: lead.Title,
      account_id: account_id,
      salesforce_lead_id: lead.salesforce_lead_id ?? null,
      salesforce_contact_id: lead.salesforce_contact_id ?? null,
      duplicate: lead.duplicate,
      user_id: lead.user_id,
      assigned_time: new Date(),
    });

    //Creating lead phone numbers
    const [_, errForNumbers] =
      await LeadPhoneNumberRepository.createPhoneNumbers(
        lead.phone_number,
        createdLead.lead_id
      );
    if (errForNumbers)
      return [null, 'Error while creating lead phone numbers.'];

    // Creating lead emails
    let emails, errWhileCreatingMails;

    if (lead.emails) {
      [emails, errWhileCreatingMails] =
        await LeadEmailRepository.createLeadEmails(
          lead.emails,
          createdLead.lead_id
        );
      if (errWhileCreatingMails)
        return [null, 'Error while creating lead emails.'];
    }

    let [unsubscribed, ___] = await hasLeadUnsubscribed(
      createdLead.lead_id
    );

    // Creating lead to cadence link
    const [createdLink, errForLink] =
      await LeadToCadenceRepository.createLeadToCadenceLink({
        lead_id: createdLead.lead_id,
        cadence_id: lead.cadence_id,
        status:
          lead.cadenceStatus === CADENCE_STATUS.IN_PROGRESS
            ? CADENCE_LEAD_STATUS.IN_PROGRESS
            : CADENCE_STATUS.NOT_STARTED,
        lead_cadence_order: lead.leadCadenceOrder,
        unsubscribed: unsubscribed ?? false,
      });
    if (errForLink) return [null, 'Error while creating lead to cadence link.'];

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully: ' + createdLead.lead_id);

    const [status, errForStatus] = await StatusRepository.createStatus({
      lead_id: createdLead.lead_id,
      message: 'Created new lead',
      status: LEAD_STATUS.NEW_LEAD,
    });

    if (errForStatus)
      return [null, `Error while creating status: ${errForStatus}.`];

    logger.info(`Lead status entry created.`);
    return [createdLead, null];
  } catch (err) {
    logger.error(
      `Error while creating and assigning contact from salesforce: ${err.message}`
    );
    if (err.errors[0].message.includes('must be unique'))
      return [null, err.errors[0].message];
    return [null, err.message];
  }
};

const createAndAssignLeadFromAutomation = async (lead) => {
  try {
    logger.info('Creating lead..');

    let phone_number = lead.kasprPhoneNumber.concat(lead.lushaPhoneNumber);
    phone_number = phone_number.concat(lead.accountId.phoneNumber);
    phone_number = phone_number.filter((n) => n);
    phone_number = phone_number.filter((n) => n !== 'NA');
    phone_number = phone_number.filter((n) => n !== 'N/A');
    console.log(phone_number);
    if (!Array.isArray(phone_number) || phone_number.length === 0)
      return [null, 'Phone number should be an array.'];

    const [account_id, errForAccount] =
      await AccountRepository.findOrCreateAccount({
        name: lead.accountId.name,
        url: lead.accountId.url,
        linkedin_url: lead.accountId.linkedinUrl,
        size: lead.accountId.size,
        country: lead.accountId.country,
        phone_number: lead.accountId.phoneNumber,
        salesforce_account_id: lead.accountId.salesforceAccountId ?? null,
      });
    if (errForAccount) return [null, 'Error while creating account.'];

    const createdLead = await Lead.create({
      status: LEAD_STATUS.NEW_LEAD,
      first_name: lead.firstName,
      last_name: lead.lastName,
      full_name: lead.firstName + ' ' + lead.lastName,
      type: LEAD_TYPE.AUTOMATION_TOOL,
      email: lead.emailID,
      email_validity: lead.emailIDValidity,
      linkedin_url: lead.linkedinUrl,
      phone_number: phone_number.join(','),
      verified: false,
      job_position: lead.jobPosition,
      account_id: account_id,
      salesforce_contact_id: lead.salesforceContactId,
      duplicate: lead.duplicate,
      user_id: lead.user_id,
      assigned_time: new Date(),
    });

    //Creating lead phone numbers
    const [_, errForNumbers] =
      await LeadPhoneNumberRepository.createPhoneNumbers(
        phone_number,
        createdLead.lead_id
      );
    if (errForNumbers)
      return [null, 'Error while creating lead phone numbers.'];

    const [createdLink, errForLink] =
      await LeadToCadenceRepository.createLeadToCadenceLink(
        createdLead.lead_id,
        lead.cadence_id
      );
    if (errForLink) return [null, 'Error while creating lead to cadence link.'];

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;
    logger.info('Lead created successfully.', createdLead.lead_id);
    return [createdLead, null];
  } catch (err) {
    logger.error('Error while creating and assigning lead from automation:');
    console.log(err);
    if (err.errors[0].message.includes('must be unique'))
      return [null, err.errors[0].message];
    return [null, err.message];
  }
};

const createAndAssignLeadFromJson = async (lead) => {
  try {
    logger.info('Creating lead..');

    let phone_number = [
      lead['phone compte'],
      lead.Phone,
      lead.MobilePhone,
      lead['company phone'],
    ];
    phone_number = phone_number.filter((n) => n);
    phone_number = phone_number.filter((n) => n !== 'NA');
    phone_number = phone_number.filter((n) => n !== 'N/A');
    console.log(phone_number);
    if (!Array.isArray(phone_number) || phone_number.length === 0)
      return [null, 'Phone number should be an array.'];

    const [account_id, errForAccount] =
      await AccountRepository.findOrCreateAccount({
        name: lead['Account.Name'],
        url: lead['Account.Website'],
        size: lead['Account.Effectif__c'],
        country: lead['Account.Pays__c'],
        linkedin_url: lead['linkedin company'],
        phone_number: lead['company phone'],
        salesforce_account_id: lead['AccountId'] ?? null,
      });
    if (errForAccount) return [null, 'Error while creating account.'];

    const createdLead = await Lead.create({
      status: LEAD_STATUS.NEW_LEAD,
      first_name: lead.FirstName,
      last_name: lead.LastName,
      full_name: lead.FirstName + ' ' + lead.LastName,
      type: LEAD_TYPE.AUTOMATION_TOOL,
      // email: lead.Email,
      email_validity: lead.EmailIDValidity,
      job_position: lead.title,
      linkedin_url: lead.URL_Profil_Linkedin__c,
      phone_number: phone_number.join(','),
      verified: false,
      account_id: account_id,
      salesforce_contact_id: lead.Id,
      duplicate: lead.duplicate,
      user_id: lead.user_id,
      assigned_time: new Date(),
    });

    console.log('creating phone numbers->', phone_number);
    //Creating lead phone numbers
    const [_, errForNumbers] =
      await LeadPhoneNumberRepository.createPhoneNumbers(
        phone_number,
        createdLead.lead_id
      );
    if (errForNumbers)
      return [null, 'Error while creating lead phone numbers.'];

    // Creating lead emails
    if (lead.Email) {
      const [emails, errWhileCreatingEmail] =
        await LeadEmailRepository.createAdditionalEmail(
          lead.Email,
          createdLead.lead_id,
          true
        );
      if (errWhileCreatingEmail)
        return [null, 'Error while creating lead emails.'];
    }

    const [createdLink, errForLink] =
      await LeadToCadenceRepository.createLeadToCadenceLink(
        createdLead.lead_id,
        lead.cadence_id
      );
    if (errForLink) return [null, 'Error while creating lead to cadence link.'];

    createdLead.lead_cadence_id = createdLink.lead_cadence_id;

    logger.info('Lead created successfully.', createdLead.lead_id);
    return [createdLead, null];
  } catch (err) {
    logger.error('Error while creating and assigning lead from automation:');
    console.log(err);
    if (err.errors[0].message.includes('must be unique'))
      return [null, err.errors[0].message];
    return [null, err.message];
  }
};

const getLead = async (lead_id) => {
  try {
    const data = await Lead.findOne({
      where: {
        lead_id,
      },
      include: [Account, Lead_phone_number, Lead_email],
    });
    return [data, null];
  } catch (err) {
    console.log(err);
    logger.error(err);
    return [null, err];
  }
};

const getLeadsByUserId = async (salesPersonsId) => {
  try {
    const result = {};
    const leads = await Lead.findAll({
      where: {
        user_id: salesPersonsId,
        status: {
          [Op.ne]: LEAD_STATUS.TRASH,
        },
      },
      attributes: ['lead_id', 'first_name', 'last_name'],
    });
    leads.map((l) => {
      result[l.lead_id] = l.first_name + ' ' + l.last_name;
    });
    // console.log(JSON.stringify(result, null, 2));
    return [result, null];
  } catch (err) {
    console.log(err);
    logger.error(err.message);
    return [null, err];
  }
};

const getLeadsByQuery = async (query) => {
  try {
    const data = await Lead.findAll({
      where: query,
      include: [Account, Lead_phone_number, Lead_email],
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching leads by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadsByQueryWithAttributes = async (query, attributes) => {
  try {
    const data = await Lead.findAll({
      where: query,
      attributes,
      include: [
        { model: User, attributes: ['user_id', 'salesforce_owner_id'] },
      ],
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching leads by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getOnlyLeadByQuery = async (query) => {
  try {
    const data = await Lead.findOne({
      where: query,
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while fetching only lead by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadByQuery = async (query) => {
  try {
    const data = await Lead.findOne({
      where: query,
      include: [
        Account,
        Lead_phone_number,
        Lead_email,
        { model: LeadToCadence, include: [Cadence] },
        {
          model: User,
          include: [
            {
              model: Company,
              include: [Company_Settings],
            },
            {
              model: User_Token,
              attributes: [
                'lusha_service_enabled',
                'kaspr_service_enabled',
                'encrypted_salesforce_instance_url',
                'salesforce_instance_url',
              ],
            },
          ],
        },
      ],
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while fetching lead by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadWithPhoneAndEmailByQuery = async (query) => {
  try {
    const data = await Lead.findOne({
      where: query,
      include: [Lead_phone_number, Lead_email],
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while fetching lead by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadBySalesforceLeadId = async (salesforce_lead_id) => {
  try {
    const data = await Lead.findOne({
      where: {
        salesforce_lead_id,
      },
      include: [Lead_phone_number, Lead_email],
    });
    if (data === null) {
      return [false, null];
    }
    return [true, null];
  } catch (err) {
    console.log(err);
    logger.error(err);
    return [null, err];
  }
};

const getLeads = async (salesPersonsId) => {
  try {
    const leads = await Lead.findAll({
      where: {
        user_id: salesPersonsId,
      },
      include: [Lead_phone_number, Lead_email],
    });
    return [leads, null];
  } catch (err) {
    console.log(err);
    logger.error(err.message);
    return [null, err];
  }
};

const getTrashLeads = async (user_id) => {
  try {
    const trashLeads = await Lead.findAll({
      where: {
        status: LEAD_STATUS.TRASH,
        user_id,
      },
      include: [
        {
          // From DESC order, get the second-last record which is status of the lead before trash
          model: Status,
          where: {
            status: {
              [Op.in]: [LEAD_STATUS.NEW_LEAD, LEAD_STATUS.ONGOING],
            },
          },
          order: [['created_at', 'DESC']],
          limit: 1,
        },
      ],
    });

    // seperate by previous status
    let result = {};
    Object.values(LEAD_STATUS).map((status) => {
      if (status !== LEAD_STATUS.TRASH) {
        result[status] = trashLeads.filter(
          (lead) => lead.Statuses[0].status === status
        );
      }
    });

    // seperate test web from new leads
    let testWebLeads = [];
    result[LEAD_STATUS.NEW_LEAD].map((lead, i) => {
      if (lead.type === LEAD_TYPE.TEST_WEB) {
        testWebLeads.push(lead);
        result[LEAD_STATUS.NEW_LEAD].splice(i, 1);
      }
    });

    result[LEAD_TYPE.TEST_WEB] = testWebLeads;
    return [result, null];
    // return [JSON.parse(JSON.stringify(trashLeads)), null];
  } catch (err) {
    logger.error(err.message);
    return [null, err.message];
  }
};

const getUnassignedLeads = async () => {
  try {
    const data = await Lead.findAll({
      where: {
        user_id: null,
      },
      include: [Account, Lead_phone_number],
    });
    return [data, null];
  } catch (err) {
    logger.error(err);
    return [null, err];
  }
};

const findLeadByPhone = async (phone_number) => {
  try {
    const data = await Lead.findOne({
      where: { phone_number },
    });
    if (data) {
      return [data, null];
    }
    logger.error(`No lead found with phone_number ${phone_number}`);
    return [null, null];
  } catch (err) {
    logger.error('Error while getting lead by phone:- ' + err.message);
    return [null, err];
  }
};

const findLeadByEmail = async (email) => {
  try {
    const data = await Lead.findOne({
      where: { email },
    });
    if (data) {
      return [data, null];
    }
    logger.error(`No lead found with email ${email}`);
    return [null, null];
  } catch (err) {
    logger.error('Error while getting lead by email:- ' + err.message);
    return [null, err];
  }
};

const updateLead = async (lead) => {
  try {
    const data = await Lead.update(lead, {
      where: {
        lead_id: lead.lead_id,
      },
    });
    const account = await Account.update(
      {
        ...lead.account,
      },
      {
        where: { account_id: lead.account_id },
      }
    );
    return [data, null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while updating lead: ${err.message}`);
    return [null, err.message];
  }
};

const updateLeads = async (query, lead) => {
  try {
    const data = await Lead.update(lead, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(`Error while updating leads: ${err.message}`);
    return [null, err.message];
  }
};

const deleteLead = async (lead_id) => {
  try {
    const data = await Lead.destroy({
      where: {
        lead_id: lead_id,
      },
    });
    return [data, null];
  } catch (err) {
    logger.error(err);
    return [null, err];
  }
};

const getLeadsCountByStatus = async (query) => {
  try {
    const leads = await Lead.findAll({
      where: query,
      attributes: [[sequelize.literal(`COUNT(lead_id)`), 'count'], 'status'],
      group: 'status',
    });

    // console.log(JSON.stringify(leads, null, 4));

    return [JSON.parse(JSON.stringify(leads)), null];
  } catch (err) {
    console.log(err);
    logger.error(`Error while fetching leads by status: ${err.message}.`);
    return [null, err.message];
  }
};

// getLeadsCountByStatus({ user_id: 2 });

const getNewleads = async (salesPersonId) => {
  try {
    const data = await Lead.findAll({
      where: {
        user_id: salesPersonId,
        [Op.and]: [
          // if the status = new_lead then for_test_web should be false because it will be included under test_web
          { status: LEAD_STATUS.NEW_LEAD },
          {
            [Op.not]: {
              type: [LEAD_TYPE.TEST_WEB, LEAD_TYPE.TRIAL_COMPLETED],
            },
          },
        ],
      },
      include: [
        {
          model: Account,
          attributes: ['name', 'size'],
        },
        {
          model: Lead_phone_number,
          attributes: ['timezone', 'time', 'is_primary', 'phone_number'],
        },
        {
          model: Lead_email,
        },
      ],
      attributes: [
        // include: [
        'lead_id',
        'first_name',
        'last_name',
        'type',
        'created_at',
        'duplicate',
        [
          Sequelize.where(
            Sequelize.fn(
              'timestampdiff',
              Sequelize.literal('hour'),
              Sequelize.col('assigned_time'),
              Sequelize.fn('now')
            ),
            '<=',
            TIME_DIFF_FOR_NEW_LEAD
          ),
          'isNew',
        ],
        // ],
      ],
      order: [['assigned_time', 'DESC']],
      // logging: console.log,
    });
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching new leads: ${err.message}`);
    return [null, err];
  }
};

const getOngoingLeads = async (salesPersonId) => {
  try {
    const data = await Lead.findAll({
      where: {
        user_id: salesPersonId,
        status: {
          // if status = ongoing or paused then it should be included
          [Op.in]: [LEAD_STATUS.ONGOING],
        },
      },
      include: [
        {
          model: Account,
          attributes: ['name', 'size'],
        },
        {
          model: Activity,
          attributes: ['incoming', 'read', 'type', 'created_at'],
          order: [['created_at', 'DESC']],
          limit: 1,
        },
        {
          model: Lead_phone_number,
          attributes: ['timezone', 'time', 'is_primary', 'phone_number'],
        },
        {
          model: Lead_email,
        },
      ],
      attributes: [
        // include: [
        'lead_id',
        'first_name',
        'last_name',
        'type',
        'created_at',
        'duplicate',
        [sequelize.literal('0'), 'isNew'],
        // ],
      ],
    });
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching ongoing leads: ${err.message}`);
    return [null, err];
  }
};

const getTestWebLeads = async (salesPersonId) => {
  try {
    const data = await Lead.findAll({
      logger: console.log,
      where: {
        [Op.and]: [
          { user_id: salesPersonId },
          //{
          //  [Op.or]: [
          //    { type: LEAD_TYPE.TEST_WEB },
          //    { type: LEAD_TYPE.TRIAL_COMPLETED },
          //    { type: LEAD_TYPE.TRIAL_NOT_COMPLETED },
          //  ],
          //},
          {
            type: [LEAD_TYPE.TEST_WEB, LEAD_TYPE.TRIAL_COMPLETED],
          },
          {
            status: LEAD_STATUS.NEW_LEAD,
          },
        ],
        // only leads with status = new_lead and type = test_web will be included
      },
      include: [
        {
          model: Account,
          attributes: ['name', 'size'],
        },
        {
          model: Lead_phone_number,
          attributes: ['timezone', 'time', 'is_primary', 'phone_number'],
        },
        {
          model: Lead_email,
        },
      ],
      attributes: [
        // include: [
        'lead_id',
        'first_name',
        'last_name',
        'type',
        'created_at',
        'duplicate',
        [
          Sequelize.where(
            Sequelize.fn(
              'timestampdiff',
              Sequelize.literal('hour'),
              Sequelize.col('assigned_time'),
              Sequelize.fn('now')
            ),
            '<=',
            TIME_DIFF_FOR_NEW_LEAD
          ),
          'isNew',
          // ],
        ],
      ],
      order: [['assigned_time', 'DESC']],
    });
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching test web leads: ${err.message}`);
    return [null, err];
  }
};

const assignSalesPerson = async (lead_id, user_id) => {
  try {
    const requiredLead = await Lead.findOne({
      // fetching it so it can be sent through socket for live update.
      where: {
        lead_id: lead_id,
      },
      include: {
        model: Account,
      },
    });
    if (!requiredLead) {
      return [null, 'No lead found.'];
    }
    await requiredLead.update({
      user_id: user_id,
      status: LEAD_STATUS.NEW_LEAD,
      assigned_time: new Date(),
    });
    logger.info(
      `LEAD:- ${
        requiredLead.first_name + ' ' + requiredLead.last_name
      } assigned to USER:- ${user_id}`
    );
    return [requiredLead.dataValues, null];
  } catch (err) {
    console.log(err);
    logger.error(err.message);
    return [null, err];
  }
};

const updateContactTime = async (lead_id, user_id) => {
  try {
    let msg = '';
    const requiredLead = await Lead.findOne({
      where: {
        lead_id: lead_id,
      },
    });

    if (requiredLead) {
      if (requiredLead.user_id === user_id) {
        if (!requiredLead.first_contact_time) {
          await Lead.update(
            {
              first_contact_time: new Date(),
              status: LEAD_STATUS.ONGOING,
            },
            {
              where: {
                lead_id,
              },
            }
          );

          msg = `Updated contact time and status for lead ${lead_id} assigned to user ${user_id}`;
          logger.info(msg);
          return [msg, null];
        } else {
          msg = `Can't update contact time,Lead ${lead_id} has already been contacted by user ${user_id}`;
          logger.error(msg);
          return [null, msg];
        }
      } else {
        msg = `Can't update contact time, Lead ${lead_id} is not assigned to user ${user_id}`;
        logger.error(msg);
        return [null, msg];
      }
    } else {
      msg = `Can't update contact time, No lead found with id ${lead_id}.`;
      logger.error(msg);
      return [null, msg];
    }
  } catch (err) {
    logger.error("Can't update contact time:- " + err.message);
    return [null, err];
  }
};

const getLeadCountByStatus = async (user_id, timezone, status, filter) => {
  try {
    const [lowerBound, upperBound] =
      MetricsHelper.metricsFilterForLead[filter](timezone);
    // console.log(lowerBound,upperBound);
    let leads = await Lead.findAll({
      where: {
        user_id,
        [Op.and]: [
          {
            status: status,
          },
          Sequelize.where(
            Sequelize.fn('UNIX_TIMESTAMP', Sequelize.col('updated_at')),
            '>=',
            parseInt(lowerBound / 1000)
          ),
          Sequelize.where(
            Sequelize.fn('UNIX_TIMESTAMP', Sequelize.col('updated_at')),
            '<=',
            parseInt(upperBound / 1000)
          ),
        ],
      },
    });
    leads = JSON.parse(JSON.stringify(leads));
    return [leads.length, null];
  } catch (err) {
    logger.error('Cannot get lead count by status: ' + err.message);
    return [null, err];
  }
};
// getLeadCountByStatus(1,"Asia/Kolkata","today","ongoing");

const searchMultipleLeads = async (user_id, body) => {
  try {
    let leads = await Lead.findAll({
      where: {
        [Op.and]: [
          { user_id: user_id },
          Sequelize.where(Sequelize.fn('lower', Sequelize.col('full_name')), {
            [Op.like]: `%${body.search.toLowerCase()}%`,
          }),
        ],
        //user_id,
      },
      attributes: ['lead_id', 'first_name', 'last_name', 'full_name', 'status'],
      include: [
        {
          model: Account,
          attributes: ['name', 'size'],
        },
      ],
    });

    let accountLeads = await Lead.findAll({
      where: { user_id },
      attributes: ['lead_id', 'first_name', 'last_name', 'full_name', 'status'],
      include: [
        {
          model: Account,
          attributes: ['name', 'size'],
          where: sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {
            [Op.like]: `${body.search.toLowerCase()}%`,
          }),
        },
      ],
    });

    leads = leads.concat(accountLeads);

    return [leads, null];
  } catch (err) {
    logger.error('Multiple lead search unsuccessful: ', err);
    return [null, err];
  }
};

const deleteLeadByQuery = async (query) => {
  try {
    const lead = await Lead.findOne({ where: query });
    if (lead === null) return [null, null];
    const deletedLead = await Lead.destroy({
      where: query,
    });
    const leadPhoneNumber = await Lead_phone_number.destroy({
      where: { lead_id: lead.dataValues.lead_id },
    });
    const leadEmail = await Lead_email.destroy({
      where: { lead_id: lead.dataValues.lead_id },
    });
    return [lead.dataValues, null];
  } catch (err) {
    logger.error(`Error while deleting leads by query: ${err.message}.`);
    return [null, err.message];
  }
};

const deleteLeadsByQuery = async (query) => {
  try {
    const leadPhoneNumber = await Lead_phone_number.destroy({
      where: query,
    });
    const leads = await Lead.destroy({
      where: query,
    });
    const leadEmail = await Lead_email.destroy({
      where: query,
    });
    return [true, null];
  } catch (err) {
    logger.error(`Error while deleting leads by query: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadsWithActivities = async (leadQuery, taskQuery = {}) => {
  try {
    let whereForTask = {};

    if (Object.values(taskQuery).length)
      whereForTask = {
        where: taskQuery,
      };

    const leads = await Lead.findAll({
      where: leadQuery,
      include: [
        {
          model: Task,
          ...whereForTask,
        },
        {
          model: Account,
        },
        {
          model: Activity,
        },
      ],
      order: [[{ model: Activity }, 'created_at', 'DESC']], // * descending order for Activites
    });

    return [leads, null];
  } catch (err) {
    logger.error(`Error while fetching leads with activities: ${err.message}.`);
    return [null, err.message];
  }
};

const getCadenceByLeadEmail = async (email) => {
  try {
    const data = await Lead.findOne({
      where: { email },
      include: [
        {
          model: Cadence,
        },
      ],
    });
    if (data) {
      return [data, null];
    }
    logger.error(`No lead found with email ${email}`);
    return [null, null];
  } catch (err) {
    logger.error('Error while getting lead by email:- ' + err.message);
    return [null, err];
  }
};

const getNewLeadsCount = async (query) => {
  try {
    const newLeads = await Lead.count({
      where: query,
    });

    return [newLeads, null];
  } catch (err) {
    logger.error(`Error while fetching new leads count: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadsWithIncompleteAutomatedMailTask = async (query) => {
  try {
    const leads = await Lead.findAll({
      where: query,
      include: {
        model: Task,
        where: {
          completed: 0,
        },
        include: {
          model: Node,
          where: {
            type: NODE_TYPES.AUTOMATED_MAIL,
            is_first: 1,
          },
        },
      },
    });

    return [leads, null];
  } catch (err) {
    logger.error(
      `Error while running getLeadsWithIncompleteAutomatedMailTask: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getCountForInQueue = async (query, userQuery) => {
  try {
    // * leads not having any task
    //  query: {
    //         '$Tasks.task_id$': null,
    //       }
    const leads = await Lead.count({
      where: query,
      include: [
        {
          model: User,
          where: userQuery,
        },
        {
          model: Task,
        },
      ],
      // logging: console.log,
    });
    // console.log(`queue: `, JSON.stringify(leads, null, 4));
    // console.log(`queue: `, leads);

    return [leads, null];
  } catch (err) {
    logger.error(
      `Error while fetching count for leads in queue: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getCountForInProgress = async (query, userQuery) => {
  try {
    // * having atleast one completed task
    const leads = await Lead.findAll({
      where: query,
      include: [
        {
          model: User,
          where: userQuery,
        },
        {
          model: Task,
          where: {
            completed: 1,
          },
        },
      ],
      // logging: console.log,
    });

    // console.log(`progress: `, JSON.stringify(leads, null, 4));
    // console.log(`progress: `, leads.length);

    return [JsonHelper.parse(leads).length, null];
  } catch (err) {
    logger.error(`Error while fetching leads: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadsByCadenceId = async (cadence_id) => {
  try {
    const data = await Lead.findAll({
      include: [
        {
          model: LeadToCadence,
          where: {
            cadence_id,
          },
          required: true,
        },
        {
          model: Account,
          include: [User],
        },
        User,
        Lead_phone_number,
        Lead_email,
      ],
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching leads by cadence id: ${err.message}.`);
    return [null, err.message];
  }
};

const getCadenceLeadsByQuery = async (query, cadence_id) => {
  try {
    const data = await Lead.findAll({
      where: query,
      include: [
        {
          model: LeadToCadence,
          where: {
            cadence_id,
          },
          required: true,
        },
      ],
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(`Error while fetching leads by cadence id: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadsIdFromQuery = async (query) => {
  try {
    const leadIds = await Lead.findAll({
      where: query,
      attributes: ['lead_id', 'account_id'],
    });

    return [JsonHelper.parse(leadIds), null];
  } catch (err) {
    logger.error(`Error while fetching leads id from query: ${err.message}.`);
    return [null, err.message];
  }
};

const getLeadsByUserAndPhoneNumber = async (user_id, phone_number) => {
  try {
    const leads = await Lead.findAll({
      where: { user_id },
      include: [
        {
          model: Lead_phone_number,
          required: true,
          where: {
            phone_number: {
              [Op.endsWith]: phone_number,
            },
          },
        },
      ],
    });

    return [JsonHelper.parse(leads), null];
  } catch (err) {
    logger.error(
      `Error while fetching leads by user and phone number: ${err.message}`
    );
    return [null, err.message];
  }
};

const getLeadsByQueryWithIncludedModelAttributes = async (
  leadQuery,
  leadAttributes = [],
  accountAttributes = [],
  leadPhoneNumberAttributes = []
) => {
  try {
    let leadAttributesObject = {};
    let accountAttributesObject = {};
    let leadPhoneNumberAttributesObject = {};

    if (leadAttributes.length !== 0)
      leadAttributesObject = {
        attributes: leadAttributes,
      };

    if (accountAttributes.length !== 0)
      accountAttributesObject = {
        attributes: accountAttributes,
      };
    if (leadPhoneNumberAttributes.length !== 0)
      leadPhoneNumberAttributesObject = {
        attributes: leadPhoneNumberAttributes,
      };

    const leads = await Lead.findAll({
      where: leadQuery,
      ...leadAttributesObject,
      include: [
        {
          model: Account,
          ...accountAttributesObject,
        },
        {
          model: Lead_phone_number,
          ...leadPhoneNumberAttributesObject,
        },
      ],
    });

    return [leads, null];
  } catch (err) {
    logger.error(
      `Error while fetching leads by query with included model attributes: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getAvgTimeTillFirstCall = async (leadQuery) => {
  try {
    const leads = await Lead.findAll({
      where: leadQuery,
      attributes: [
        [
          sequelize.literal(`AVG(avg_time_till_first_call)`),
          'avg_time_for_call',
        ],
      ],
    });
    // console.log(JSON.parse(JSON.stringify(leads)));
    return [JsonHelper.parse(leads), null];
  } catch (err) {
    logger.error(
      `Error while fetching avg time till first call: ${err.message}.`
    );
    return [null, err.message];
  }
};

// * Get disqualified (status: trash) leads with limit
const getDisqualifiedLeadsWithLimit = async (limit) => {
  try {
    const data = await Lead.findAll({
      limit,
      where: {
        status: LEAD_STATUS.TRASH,
      },
    });

    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(
      `Error while fetching disqualified leads with limit: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getLeadsForLeadsListView = async (
  queryObject,
  attributesObject,
  extrasQuery
) => {
  try {
    const leads = await Lead.findAll({
      where: {
        ...queryObject.lead,
      },
      ...attributesObject.lead,
      include: [
        {
          model: LeadToCadence,
          ...attributesObject.leadToCadence,
          include: [
            {
              model: Task,
              on: {
                [Op.and]: [
                  sequelize.where(
                    sequelize.col('LeadToCadences.cadence_id'),
                    Op.eq,
                    sequelize.col('LeadToCadences.Tasks.cadence_id')
                  ),
                  sequelize.where(
                    sequelize.col('LeadToCadences.lead_id'),
                    Op.eq,
                    sequelize.col('LeadToCadences.Tasks.lead_id')
                  ),
                  sequelize.where(
                    sequelize.col('LeadToCadences.Tasks.is_skipped'),
                    Op.eq,
                    false
                  ),
                  sequelize.where(
                    sequelize.col('LeadToCadences.Tasks.completed'),
                    Op.eq,
                    false
                  ),
                  sequelize.where(
                    sequelize.col('LeadToCadences.Tasks.node_id'),
                    Op.notIn,
                    [Object.values(CUSTOM_TASK_NODE_ID)]
                  ),
                ],
              },
              attributes: ['task_id'],
              include: [
                {
                  model: Node,
                  attributes: ['type', 'step_number'],
                },
              ],
            },
            {
              model: Cadence,
              where: {
                ...queryObject.cadence,
              },
              ...attributesObject.cadence,
              required: Object.keys(queryObject.cadence || {}).length
                ? true
                : false,
              include: [
                {
                  model: Node,
                  attributes: [
                    'node_id',
                    //[sequelize.literal('Lead.lead_id'), 'l'],
                  ],
                  //...attributesObject.node,
                },
              ],
            },
          ],
        },
        {
          model: Activity,
          //required: Object.keys(queryObject.activity || {}).length
          //? true
          //: false,
          //where: {
          //...queryObject.activity,
          //},
          ...attributesObject.activity,
          order: [['created_at', 'DESC']],
          limit: 1,
        },
        {
          model: Account,
          required: Object.keys(queryObject.account || {}).length
            ? true
            : false,
          where: {
            ...queryObject.account,
          },
          ...attributesObject.account,
        },
      ],
      //logging: console.log,
      ...extrasQuery,
    });

    //console.log(JSON.stringify(leads, null, 4));
    return [JsonHelper.parse(leads), null];
  } catch (err) {
    //console.log(err);
    logger.error(`Error while fetching leads for leads view: `, err);
    return [null, err.message];
  }
};

const test = async ({ query, include, extras }) => {
  try {
    console.log('running');
    const leads = await Lead.findAll({
      where: query,
      include,
      ...extras,
    });

    console.log(JSON.stringify(leads, null, 4));
  } catch (err) {
    console.log(err);
    logger.error(`Error: `, err);
  }
};

const getDuplicateBySalesforceContactIdCount = async () => {
  try {
    const leads = await Lead.findAll({
      group: ['salesforce_contact_id'],
      having: sequelize.literal('COUNT(salesforce_contact_id) > 1'),
      attributes: [
        'lead_id',
        'salesforce_contact_id',
        [sequelize.literal('COUNT(salesforce_contact_id)'), 'count'],
      ],
    });
    return [JsonHelper.parse(leads), null];
  } catch (err) {
    logger.error(`Error while fetching duplicate leads : `, err);
    return [null, err.message];
  }
};

const getDuplicateBySalesforceLeadIdCount = async () => {
  try {
    const leads = await Lead.findAll({
      group: ['salesforce_lead_id'],
      having: sequelize.literal('COUNT(salesforce_lead_id) > 1'),
      attributes: [
        'lead_id',
        'salesforce_lead_id',
        [sequelize.literal('COUNT(salesforce_lead_id)'), 'count'],
      ],
    });
    return [JsonHelper.parse(leads), null];
  } catch (err) {
    logger.error(`Error while fetching duplicate leads : `, err);
    return [null, err.message];
  }
};

const getActiveLeadCountByCadenceId = async ({
  cadence_id,
  start_date = null,
  end_date = null,
}) => {
  try {
    const activeContactsCount = await Lead.findAll({
      where: {
        status: {
          [Op.in]: [
            LEAD_STATUS.ACTIVE,
            LEAD_STATUS.ONGOING,
            LEAD_STATUS.PAUSED,
          ],
        },
      },

      include: [
        {
          model: LeadToCadence,
          attributes: ['lead_id'],
          required: true,
          where: {
            cadence_id: cadence_id ?? { [Op.ne]: null },
          },
        },
        {
          model: User,
          attributes: ['first_name', 'last_name'],
        },
      ],

      attributes: [
        [sequelize.literal(`COUNT(DISTINCT lead.lead_id) `), 'count'],
        // [sequelize.literal(`COUNT(DISTINCT lead.lead_id) WHERE status="in_progress" `), 'count_status'],
        [sequelize.col('User.user_id'), 'user_id'],
        [sequelize.col('User.first_name'), 'first_name'],
        [sequelize.col('User.last_name'), 'last_name'],
        // [sequelize.col('LeadToCadences.status'), 'status'],
      ],
      group: ['User.user_id'],
      // raw: true,
    });
    // console.log(JsonHelper.parse(activeContactsCount));
    return [JsonHelper.parse(activeContactsCount), null];
  } catch (err) {
    logger.error(
      `Error while fetching active leads count by cadence id: `,
      err
    );
    return [null, err.message];
  }
};

// getActiveLeadCountByCadenceId({
//   cadence_id: ['105'],
// });

const LeadRepository = {
  createUnassignedLead,
  createAndAssignLead,
  createAndAssignLeadFromAutomation,
  createAndAssignLeadFromSalesforce,
  createAndAssignContactFromSalesforce,
  createAndAssignLeadFromJson,
  //getLead,
  getLeadBySalesforceLeadId,
  //getUnassignedLeads,
  updateLead,
  updateLeads,
  deleteLead,
  getNewleads,
  getOngoingLeads,
  getTestWebLeads,
  assignSalesPerson,
  //getLeadsByUserId,
  updateContactTime,
  //findLeadByPhone,
  //findLeadByEmail,
  //getLeads,
  getTrashLeads,
  getLeadCountByStatus,
  searchMultipleLeads,
  getLeadsByQuery,
  getOnlyLeadByQuery,
  getLeadByQuery,
  getLeadWithPhoneAndEmailByQuery,
  getLeadsByQueryWithAttributes,
  deleteLeadByQuery,
  deleteLeadsByQuery,
  getLeadsCountByStatus,
  getLeadsWithActivities,
  getCadenceByLeadEmail,
  getNewLeadsCount,
  getCountForInQueue,
  getLeadsWithIncompleteAutomatedMailTask,
  getCountForInProgress,
  getLeadsByCadenceId,
  getCadenceLeadsByQuery,
  getLeadsIdFromQuery,
  getLeadsByUserAndPhoneNumber,
  getLeadsByQueryWithIncludedModelAttributes,
  getAvgTimeTillFirstCall,
  getDisqualifiedLeadsWithLimit,
  getLeadsForLeadsListView,
  test,
  getDuplicateBySalesforceContactIdCount,
  getDuplicateBySalesforceLeadIdCount,
  test,
  getActiveLeadCountByCadenceId,
};

module.exports = LeadRepository;
