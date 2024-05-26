const logger = require('../../utils/winston');
const CustomVariablesHelper = require('./customVariables');
const replaceall = require('replaceall');
const { nanoid } = require('nanoid');
// const number = require('@hapi/joi/lib/types/number');
const UserHelper = require('../user');

const removeUnprocessedVariables = (body) => {
  if (typeof body !== 'string') return body;
  try {
    // Algorithm to find unprocessed variables and store them in Set
    let st = [];
    let variable = '';
    let variables = new Set();
    for (const ch of body) {
      if (ch === '{') {
        if (st.length < 2) st.push(ch);
      } else if (ch === '}' && st.length) {
        st.pop();
        if (st.length === 0 && variable.length) {
          variables.add(variable);
          variable = '';
        }
      } else if (st.length === 2) {
        variable += ch;
      } else {
        st = [];
        variable = '';
      }
    }

    // Removing the unprocessed variables from body and returning it
    let modBody = body;
    variables.forEach((variable) => {
      if (
        !variable.includes('custom_link') &&
        !variable.includes('unsubscribe')
      )
        modBody = replaceall(`{{${variable}}}`, '', modBody);
    });
    return modBody;
  } catch (err) {
    logger.error('Error while removing unprocessed variables: ', err);
    return body;
  }
};

/**
 * @param {string} body - Body of the email
 * @param {Object} variables - Variable values
 * @param {string} variables.first_name - First Name of the Lead
 * @param {string} variables.last_name - Last Name of the Lead
 * @param {string} variables.company - Company of the Lead
 * @param {string} variables.signature - signature
 * @param {string} variables.email - Email of the Lead
 * @param {string} variables.phone - Phone of the Lead
 * @param {string} variables.country - Country of the Lead Company
 * @param {string} variables.zipcode - Zipcode of the Lead Company
 * @description Replace variables of email with lead details
 * */
const replaceVariables = (body, variables) => {
  try {
    const {
      //prospect
      first_name,
      last_name,
      company_name,
      signature,
      allSignatures,
      email,
      phone,
      job_position,
      owner,
      company_linkedin_url,
      //account
      linkedin_url,
      website,
      size,
      zipcode,
      country,
      company_phone_number,
      //sender
      sender_first_name,
      sender_last_name,
      sender_name,
      sender_email,
      sender_phone_number,
      sender_company,
      //Date variables
      today,
      today_day,
      tomorrow,
      tomorrow_day,
      fromTimezone,
      calendly_link,
      //other
      zoom_info,
    } = variables;

    //capitalize date variables
    body = CustomVariablesHelper.getDateRegexHelpers.capitalizeDate(body);
    //prospect variables
    body = replaceall('{{first_name}}', first_name?.toString() ?? '', body);
    body = replaceall('{{last_name}}', last_name?.toString() ?? '', body);
    body = replaceall('{{company_name}}', company_name?.toString() ?? '', body);
    body = replaceall(
      '{{full_name}}',
      `${first_name} ${last_name}`?.toString() ?? '',
      body
    );
    body = replaceall('{{email}}', email?.toString() ?? '', body);
    body = replaceall('{{phone}}', phone?.toString() ?? '', body);
    body = replaceall('{{job_position}}', job_position?.toString() ?? '', body);
    body = replaceall('{{owner}}', owner?.toString() ?? '', body);
    body = replaceall('{{linkedin_url}}', linkedin_url?.toString() ?? '', body);
    //account variables
    body = replaceall(
      '{{company_linkedin_url}}',
      company_linkedin_url?.toString() ?? '',
      body
    );

    body = replaceall('{{website}}', website?.toString() ?? '', body);
    body = replaceall('{{size}}', size?.toString() ?? '', body);
    body = replaceall('{{zipcode}}', zipcode?.toString() ?? '', body);
    body = replaceall('{{country}}', country?.toString() ?? '', body);
    body = replaceall(
      '{{company_phone_number}}',
      company_phone_number?.toString() ?? '',
      body
    );
    //sender Variables

    body = replaceall(
      '{{sender_first_name}}',
      sender_first_name?.toString() ?? '',
      body
    );
    body = replaceall(
      '{{sender_last_name}}',
      sender_last_name?.toString() ?? '',
      body
    );
    body = replaceall('{{sender_name}}', sender_name?.toString() ?? '', body);
    body = replaceall('{{sender_email}}', sender_email?.toString() ?? '', body);
    body = replaceall(
      '{{sender_phone_number}}',
      sender_phone_number?.toString() ?? '',
      body
    );

    body = replaceall(
      '{{sender_company}}',
      sender_company?.toString() ?? '',
      body
    );
    //Date variables
    body = replaceall('{{today}}', today?.toString() ?? '', body);
    body = replaceall('{{tomorrow}}', tomorrow?.toString() ?? '', body);
    body = replaceall(
      '{{today_day(en)}}',
      CustomVariablesHelper.getTranslatedDay('en', today_day) ?? '',
      body
    );
    body = replaceall(
      '{{today_day(en)_capital}}',
      CustomVariablesHelper.getTranslatedDay('en_capital', today_day) ?? '',
      body
    );
    body = replaceall(
      '{{tomorrow_day(en)}}',
      CustomVariablesHelper.getTranslatedDay('en', tomorrow_day) ?? '',
      body
    );
    body = replaceall(
      '{{tomorrow_day(en)_capital}}',
      CustomVariablesHelper.getTranslatedDay('en_capital', tomorrow_day) ?? '',
      body
    );

    body = replaceall(
      '{{today_day(fr)}}',
      CustomVariablesHelper.getTranslatedDay('fr', today_day) ?? '',
      body
    );
    body = replaceall(
      '{{today_day(fr)_capital}}',
      CustomVariablesHelper.getTranslatedDay('fr_capital', today_day) ?? '',
      body
    );
    body = replaceall(
      '{{tomorrow_day(fr)}}',
      CustomVariablesHelper.getTranslatedDay('fr', tomorrow_day) ?? '',
      body
    );
    body = replaceall(
      '{{tomorrow_day(fr)_capital}}',
      CustomVariablesHelper.getTranslatedDay('fr_capital', tomorrow_day) ?? '',
      body
    );

    body = replaceall(
      '{{today_day(es)}}',
      CustomVariablesHelper.getTranslatedDay('es', today_day) ?? '',
      body
    );
    body = replaceall(
      '{{today_day(es)_capital}}',
      CustomVariablesHelper.getTranslatedDay('es_capital', today_day) ?? '',
      body
    );
    body = replaceall(
      '{{tomorrow_day(es)}}',
      CustomVariablesHelper.getTranslatedDay('es', tomorrow_day) ?? '',
      body
    );
    body = replaceall(
      '{{tomorrow_day(es)_capital}}',
      CustomVariablesHelper.getTranslatedDay('es_capital', tomorrow_day) ?? '',
      body
    );
    // if (n_days) body = replaceall('{{n_days}}', n_days?.toString() ?? "", body);
    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDays(
      body,
      fromTimezone
    );
    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysAgo(
      body,
      fromTimezone
    );

    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysDay(
      body,
      fromTimezone
    );
    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysDayCapital(
      body,
      fromTimezone
    );

    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysAgoDay(
      body,
      fromTimezone
    );
    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysAgoDayCapital(
      body,
      fromTimezone
    );

    // if (n_days_only_working)
    //   body = replaceall('{{N week_days_from_now}}', n_days_only_working?.toString() ?? "", body);
    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysWorking(
      body,
      fromTimezone
    );
    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysWorkingAgo(
      body,
      fromTimezone
    );

    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysWorkingDay(
      body,
      fromTimezone
    );
    body =
      CustomVariablesHelper.getDateRegexHelpers.replaceNDaysWorkingDayCapital(
        body,
        fromTimezone
      );

    body = CustomVariablesHelper.getDateRegexHelpers.replaceNDaysWorkingAgoDay(
      body,
      fromTimezone
    );
    body =
      CustomVariablesHelper.getDateRegexHelpers.replaceNDaysWorkingAgoDayCapital(
        body,
        fromTimezone
      );

    body = CustomVariablesHelper.getDateRegexHelpers.handleFallbackVariables(
      body,
      variables
    );

    //Ringover Meet
    body = replaceall(
      '{{ringover_meet}}',
      `meet.ringover.io/${nanoid()}`?.toString() ?? '',
      body
    );

    //Signature
    body = CustomVariablesHelper.getDateRegexHelpers.replaceAllSignatures(
      body,
      variables
    );

    if (calendly_link)
      body = replaceall('{{calendly_link}}', calendly_link, body);
    else body = replaceall('{{calendly_link}}', '', body);
    if (zoom_info) body = replaceall('{{zoom_info}}', zoom_info, body);
    // replace all <p *> by <div *> and </p> by </div>

    body = body.replace(/<p(.*?)>/g, '<div$1>');
    body = replaceall('</p>', '</div>', body);
    body = removeUnprocessedVariables(body);

    return body;
  } catch (err) {
    logger.error('Error while replacing variables: ', err);
    return [null, err.message];
  }
};

module.exports = replaceVariables;
