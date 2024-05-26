// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repository
const Repository = require('../../repository');

// Helpers and Services
const replaceVariables = require('./replaceVariables');
const replaceCustomVariables = require('./replaceCustomVariables');

const replaceVariablesForLead = async (body, lead_id) => {
  try {
    const [lead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: {
        lead_id,
      },
      include: {
        [DB_TABLES.ACCOUNT]: {},
        [DB_TABLES.LEAD_PHONE_NUMBER]: {},
        [DB_TABLES.LEAD_EMAIL]: {},
        [DB_TABLES.USER]: {
          [DB_TABLES.COMPANY]: {},
          [DB_TABLES.USER_TOKEN]: {},
        },
      },
    });
    if (errForLead || !lead) return [body, errForLead];

    const {
      User: user,
      Lead_phone_numbers: leadPhoneNumbers,
      Lead_emails: leadEmails,
      Account: account,
    } = lead;

    //generate date variables
    let today = new Date();

    //get day according to timezone
    let todaysDayDate = new Date().toLocaleDateString('en-US', {
      timeZone: user.timezone,
    });
    todaysDayDate = new Date(todaysDayDate);
    let todaysDay = todaysDayDate.getDay();

    let todaysDate = today.toLocaleDateString('en-GB', {
      timeZone: user.timezone,
      day: 'numeric',
      month: 'numeric',
    });

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = tomorrow.toLocaleDateString('en-GB', {
      timeZone: user.timezone,
      day: 'numeric',
      month: 'numeric',
    });

    //tomorrow day according to timezone
    let tomorrowsDay = new Date().toLocaleDateString('en-US', {
      timeZone: user.timezone,
    });
    tomorrowsDay = new Date(tomorrowsDay);
    tomorrowsDay.setDate(tomorrowsDay.getDate() + 1);
    tomorrowsDay = tomorrowsDay.getDay();

    let lead_primary_phone = '';

    let primaryPhoneNumber = leadPhoneNumbers.filter(
      (leadPhoneNumber) => leadPhoneNumber?.is_primary
    );

    lead_primary_phone = primaryPhoneNumber?.[0]?.phone_number || '';

    let lead_primary_email = '';

    let primaryEmail = leadEmails.filter((leadEmail) => leadEmail?.is_primary);

    lead_primary_email = primaryEmail?.[0]?.email_id || '';

    let signature = '';
    let allSignatures = null;

    if (
      body.includes('{{user_signature}}') ||
      body.includes('{{user_signature_primary}}')
    ) {
      let [defaultSignature, __] = await Repository.fetchOne({
        tableName: DB_TABLES.SIGNATURE,
        query: {
          is_primary: true,
          user_id: user.user_id,
        },
      });
      if (defaultSignature == null) {
        let [selectedSignature, ___] = await Repository.fetchAll({
          tableName: DB_TABLES.SIGNATURE,
          query: { user_id: user.user_id },
        });
        if (selectedSignature === null) {
          signature = selectedSignature[0].signature;
        } else {
          signature = user.first_name + ' ' + user.last_name;
        }
      } else {
        signature = defaultSignature.signature;
      }
      let [allSignature, ___] = await Repository.fetchAll({
        tableName: DB_TABLES.SIGNATURE,
        query: { user_id: user.user_id },
      });
      allSignatures = allSignature;
    }

    const variables = {
      //prospect variables
      first_name: lead?.first_name ?? '',
      last_name: lead?.last_name ?? '',
      full_name: `${lead?.first_name} ${lead?.last_name}`?.toString() ?? '',
      company_name: lead?.Account?.name ?? '',
      email: lead_primary_email ?? '',
      phone: lead_primary_phone ?? '',
      job_position: lead?.job_position ?? '',
      owner: lead?.User?.first_name + lead?.User?.last_name ?? '',
      linkedin_url: lead?.User?.linkedin_url ?? '',
      signature: signature ?? '',
      allSignatures: allSignatures ?? ' ',
      //Account Variables
      company_linkedin_url: account?.linkedin_url ?? '',
      website: account?.url ?? '',
      size: account?.size ?? '',
      zipcode: account?.zipcode?.toString() ?? '',
      country: account?.country ?? '',
      //sender variables
      sender_first_name: user.first_name ?? '',
      sender_last_name: user.last_name ?? '',
      sender_name: user.first_name + ' ' + user.last_name ?? '',
      sender_email: user.primary_email ?? user.email ?? '',
      sender_phone_number: user.primary_phone_number ?? '',
      sender_company: user.Company.name ?? '',
      //Date Variables
      today: todaysDate ?? '',
      today_day: todaysDay ?? '',
      tomorrow: tomorrow ?? '',
      tomorrow_day: tomorrowsDay ?? '',
      fromTimezone: user.timezone ?? '',
      calendly_link: user.calendly_url ?? '',
      // n_days: nDaysDate ?? '',
      // n_days_only_working: workingDateNDaysFromNow ?? '',
    };
    //Processing the custom variables
    const stringArrayToProcess = [body];
    const [processedStringArray, processingErr] = await replaceCustomVariables(
      lead,
      stringArrayToProcess,
      variables
    );
    if (processingErr) return [null, processingErr];
    body = processedStringArray[0];
    body = replaceVariables(body, variables);

    return [body, null];
  } catch (err) {
    logger.error(`Error while replacing variables for a lead: `, err);
    return [null, err.message];
  }
};

module.exports = replaceVariablesForLead;
