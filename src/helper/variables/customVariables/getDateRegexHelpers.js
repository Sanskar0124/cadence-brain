const replaceall = require('replaceall');
const getTranslatedDay = require('./getTranslatedDay');
const getMatchedFallbackVariables = require('./getMatchedFallbackVariables');
const {
  workingDateNDaysFromNow,
  workingDateNDaysAgo,
} = require('../../user/getDateForTimezone');

const replaceNDays = (body, fromTimezone) => {
  const nDaysRegex = /\{\{\d+_days\}\}/g;
  const digits = /\d+/;
  let occurences = [...new Set(body.match(nDaysRegex))];
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let nDaysDate = new Date();
    nDaysDate.setDate(nDaysDate.getDate() + n_days);
    nDaysDate = nDaysDate.toLocaleDateString('en-GB', {
      timeZone: fromTimezone,
      day: 'numeric',
      month: 'numeric',
    });
    body = replaceall(elem, nDaysDate, body);
  });
  return body;
};
const replaceNDaysAgo = (body, fromTimezone) => {
  const nDaysRegex = /\{\{\d+_days_ago\}\}/g;
  const digits = /\d+/;
  let occurences = [...new Set(body.match(nDaysRegex))];
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let nDaysDate = new Date();
    nDaysDate.setDate(nDaysDate.getDate() - n_days);
    nDaysDate = nDaysDate.toLocaleDateString('en-GB', {
      timeZone: fromTimezone,
      day: 'numeric',
      month: 'numeric',
    });
    body = replaceall(elem, nDaysDate, body);
  });
  return body;
};
const replaceNDaysDay = (body, fromTimezone) => {
  const nDaysRegex = /\{\{\d+_days_day\((\w+)\)\}\}/g;
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  let occurences = [...new Set(body.match(nDaysRegex))];
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    let nDaysDate = new Date().toLocaleDateString('en-US', {
      timeZone: fromTimezone,
    });
    nDaysDate = new Date(nDaysDate);
    nDaysDate.setDate(nDaysDate.getDate() + n_days);
    // nDaysDate = nDaysDate.toLocaleDateString('en-GB', {
    //   timeZone: fromTimezone,
    // });

    const dayOfWeek = nDaysDate.getDay();

    body = replaceall(elem, getTranslatedDay(language, dayOfWeek), body);
  });
  return body;
};

const replaceNDaysDayCapital = (body, fromTimezone) => {
  const nDaysRegex = /\{\{\d+_days_day\((\w+)\)_capital\}\}/g;
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  let occurences = [...new Set(body.match(nDaysRegex))];
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    language = language + '_capital';
    let nDaysDate = new Date().toLocaleDateString('en-US', {
      timeZone: fromTimezone,
    });
    nDaysDate = new Date(nDaysDate);
    nDaysDate.setDate(nDaysDate.getDate() + n_days);
    // nDaysDate = nDaysDate.toLocaleDateString('en-GB', {
    //   timeZone: fromTimezone,
    // });
    // nDaysDate = nDaysDate.getDay();
    const dayOfWeek = nDaysDate.getDay();
    body = replaceall(elem, getTranslatedDay(language, dayOfWeek), body);
  });
  return body;
};

const replaceNDaysAgoDay = (body, fromTimezone) => {
  const nDaysRegex = /\{\{\d+_days_ago_day\((\w+)\)\}\}/g;
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  let occurences = [...new Set(body.match(nDaysRegex))];
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    let nDaysDate = new Date();
    nDaysDate.setDate(nDaysDate.getDate() - n_days);
    // nDaysDate = nDaysDate.toLocaleDateString('en-GB', {
    //   timeZone: fromTimezone,
    // });
    nDaysDate = nDaysDate.getDay();
    body = replaceall(elem, getTranslatedDay(language, nDaysDate), body);
  });
  return body;
};

const replaceNDaysAgoDayCapital = (body, fromTimezone) => {
  const nDaysRegex = /\{\{\d+_days_ago_day\((\w+)\)_capital\}\}/g;
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  let occurences = [...new Set(body.match(nDaysRegex))];
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    language = language + '_capital';
    let nDaysDate = new Date();
    nDaysDate.setDate(nDaysDate.getDate() - n_days);
    // nDaysDate = nDaysDate.toLocaleDateString('en-GB', {
    //   timeZone: fromTimezone,
    // });
    nDaysDate = nDaysDate.getDay();
    body = replaceall(elem, getTranslatedDay(language, nDaysDate), body);
  });
  return body;
};

const replaceNDaysWorking = (body, fromTimezone) => {
  const nWorkingDaysRegex = /\{\{\d+_week_days_from_now\}\}/g;
  const occurences = [...new Set(body.match(nWorkingDaysRegex))];
  const digits = /\d+/;
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let workingDateNDaysFromNowRes = workingDateNDaysFromNow(
      n_days,
      fromTimezone
    );
    workingDateNDaysFromNowRes = workingDateNDaysFromNowRes.toLocaleDateString(
      'en-GB',
      { timeZone: fromTimezone, day: 'numeric', month: 'numeric' }
    );
    body = replaceall(elem, workingDateNDaysFromNowRes, body);
  });
  return body;
};

const replaceNDaysWorkingAgo = (body, fromTimezone) => {
  const nWorkingDaysRegex = /\{\{\d+_week_days_ago\}\}/g;
  const occurences = [...new Set(body.match(nWorkingDaysRegex))];
  const digits = /\d+/;
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let workingDateNDaysFromNowRes = workingDateNDaysAgo(n_days, fromTimezone);
    workingDateNDaysFromNowRes = workingDateNDaysFromNowRes.toLocaleDateString(
      'en-GB',
      { timeZone: fromTimezone, day: 'numeric', month: 'numeric' }
    );
    body = replaceall(elem, workingDateNDaysFromNowRes, body);
  });
  return body;
};

const replaceNDaysWorkingDay = (body, fromTimezone) => {
  const nWorkingDaysRegex = /\{\{\d+_week_days_from_now_day\((\w+)\)\}\}/g;
  const occurences = [...new Set(body.match(nWorkingDaysRegex))];
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    let workingDateNDaysFromNowRes = workingDateNDaysFromNow(
      n_days,
      fromTimezone
    );
    workingDateNDaysFromNowRes = workingDateNDaysFromNowRes.getDay();
    body = replaceall(
      elem,
      getTranslatedDay(language, workingDateNDaysFromNowRes),
      body
    );
  });
  return body;
};

const replaceNDaysWorkingDayCapital = (body, fromTimezone) => {
  const nWorkingDaysRegex =
    /\{\{\d+_week_days_from_now_day\((\w+)\)_capital\}\}/g;
  const occurences = [...new Set(body.match(nWorkingDaysRegex))];
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    language = language + '_capital';
    let workingDateNDaysFromNowRes = workingDateNDaysFromNow(
      n_days,
      fromTimezone
    );
    workingDateNDaysFromNowRes = workingDateNDaysFromNowRes.getDay();
    body = replaceall(
      elem,
      getTranslatedDay(language, workingDateNDaysFromNowRes),
      body
    );
  });
  return body;
};

const replaceNDaysWorkingAgoDay = (body, fromTimezone) => {
  const nWorkingDaysRegex = /\{\{\d+_week_days_ago_day\((\w+)\)\}\}/g;
  const occurences = [...new Set(body.match(nWorkingDaysRegex))];
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    let workingDateNDaysFromNowRes = workingDateNDaysAgo(n_days, fromTimezone);
    workingDateNDaysFromNowRes = workingDateNDaysFromNowRes.getDay();
    body = replaceall(
      elem,
      getTranslatedDay(language, workingDateNDaysFromNowRes),
      body
    );
  });
  return body;
};

const replaceNDaysWorkingAgoDayCapital = (body, fromTimezone) => {
  const nWorkingDaysRegex = /\{\{\d+_week_days_ago_day\((\w+)\)_capital\}\}/g;
  const occurences = [...new Set(body.match(nWorkingDaysRegex))];
  const digits = /\d+/;
  const lang_regex = /([a-z]{2})\)/i;
  occurences.forEach((elem) => {
    let n_days = parseInt(elem.match(digits)[0]);
    let language = elem.match(lang_regex)[1];
    language = language + '_capital';
    let workingDateNDaysFromNowRes = workingDateNDaysAgo(n_days, fromTimezone);
    workingDateNDaysFromNowRes = workingDateNDaysFromNowRes.getDay();
    body = replaceall(
      elem,
      getTranslatedDay(language, workingDateNDaysFromNowRes),
      body
    );
  });
  return body;
};

const handleFallbackVariables = (body, variables) => {
  const regex = /\{\{\s*([^|{}]+)\s*\|\s*([^|{}]+)\s*\}\}/g;
  const variable_regex = /\{\{\s*([^|{}]+)\s*\|/;
  const fallback_regex = /\|\s*([^|{}]+)\s*\}\}/;
  let occurences = [...new Set(body.match(regex))];
  occurences.forEach((elem) => {
    let variable = elem.match(variable_regex)[1].trim();
    let fallback = elem.match(fallback_regex)[1].trim();
    body = replaceall(
      elem,
      getMatchedFallbackVariables(variable, variables, fallback),
      body
    );
  });
  return body;
};

const capitalizeDate = (body) => {
  const regex = /(^|<p>|>|<br>|\.\s+)\{\{\s*([^}]+)\s*\}\}/g;

  const date_regex = /\{\{\s*([^}]+)\s*\}\}/;
  let occurences = [...new Set(body.match(regex))];
  occurences.forEach((elem) => {
    let beforeBrackets = elem.split('{')[0];
    let date = elem.match(date_regex)[1];
    const replaceVal = `${beforeBrackets}{{${date}_capital}}`;
    date = `{{${date}}}`;
    if (
      date === '{{today_day(fr)}}' ||
      date === '{{tomorrow_day(fr)}}' ||
      date === '{{today_day(es)}}' ||
      date === '{{tomorrow_day(es)}}' ||
      date.match(/\{\{\d+_days_ago_day\((\w+)\)\}\}/) ||
      date.match(/\{\{\d+_days_day\((\w+)\)\}\}/) ||
      date.match(/\{\{\d+_week_days_from_now_day\((\w+)\)\}\}/) ||
      date.match(/\{\{\d+_week_days_ago_day\((\w+)\)\}\}/)
    ) {
      body = replaceall(elem, replaceVal, body);
    }
  });
  return body;
};

const replaceAllSignatures = (body, variables) => {
  let replaceVal = '';
  const oneSignatureRegex = /\{\{user_signature\}\}/g;
  const allSignatureRegex = /\{\{user_signature\}\}\s*\(([^)]+)\)/g;
  const primarySignatureRegex = /\{\{user_signature_primary\}\}\s*\(([^)]+)\)/g;
  const signatureNameRegex = /\(([^)]+)\)/;

  //Replace {{user_signature_primary}} ( ) case
  const primarySignatureOccurences = [
    ...new Set(body.match(primarySignatureRegex)),
  ];
  primarySignatureOccurences.forEach((elem) => {
    replaceVal = variables.signature?.toString() ?? '';
    body = replaceall(elem, replaceVal, body);
  });

  //First replace {{user_signature}} ( ) case
  const allSignatureoccurences = [...new Set(body.match(allSignatureRegex))];
  allSignatureoccurences.forEach((elem) => {
    let signatureName = elem.match(signatureNameRegex)[1].trim();
    if (
      variables.allSignatures.length !== 0 &&
      variables.allSignatures !== ' '
    ) {
      const foundItem = variables.allSignatures.find(
        (item) => signatureName === item.name
      );
      replaceVal = foundItem?.signature ?? '';
    }
    body = replaceall(elem, replaceVal, body);
  });

  //Then replace only {{user_signature}} case
  const occurences = [...new Set(body.match(oneSignatureRegex))];
  occurences.forEach((elem) => {
    replaceVal = variables.signature?.toString() ?? '';
    body = replaceall(elem, replaceVal, body);
  });
  return body;
};

const getDateRegexHelpers = {
  replaceNDays,
  replaceNDaysAgo,
  replaceNDaysDay,
  replaceNDaysDayCapital,
  replaceNDaysAgoDay,
  replaceNDaysAgoDayCapital,
  replaceNDaysWorking,
  replaceNDaysWorkingAgo,
  replaceNDaysWorkingDay,
  replaceNDaysWorkingDayCapital,
  replaceNDaysWorkingAgoDay,
  replaceNDaysWorkingAgoDayCapital,
  handleFallbackVariables,
  capitalizeDate,
  replaceAllSignatures,
};

module.exports = getDateRegexHelpers;
