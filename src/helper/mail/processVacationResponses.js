const logger = require('../../utils/winston');
const {
  MAIL_AUTO_RESPONSE_HEADERS,
  MAIL_AUTO_RESPONSE_HEADER_VALUES,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const ActivityHelper = require('../../helper/activity/');

const Mail = require('../../services/Google/Mail');
const Repository = require('../../repository/');
/**
 * @description - This function is used to process the vacation responses.
 * Step 1: Check headers of Automated response for a set of headers.
 * Step 2: Find last sent email in thread and find time delta.
 * Step 3: If time delta is less than threshold, then proceed else exit.
 * Step 4: Check for keywords in the given email to flag out of office.
 * Step 5: If above validations succeed, raise an out of office notification for this lead/contact.
 * @param { parsedMessage } Object - represents the parsed mail object
 * @returns { Promise } - returns a promise
 */

const getEmailAddress = (headerField) => {
  const rfc2822EmailRegex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  const result = headerField.match(rfc2822EmailRegex);
  if (result) return result[0];
  return null;
};

const OutOfOfficePhrases = [
  //English Phrases
  'Out of office',
  'I am OOO',
  'I will be on holiday',
  'I will be away',
  'I will return',
  'I am on holidays',
  'Away from work',
  'Currently on leave',
  'I am on break',
  'Currently on break',
  'I will come back',
  //Spanish Phrases
  'Fuera de oficina',
  'Estaré fuera',
  'Vuelvo pronto',
  'Estoy de vacaciones',
  'Fuera de oficina',
  'En pausa',
  'Actualmente en pausa',
  'Vuelvo pronto',
  //French Phrases
  'Absent du bureau',
  'Je serai absent',
  'Je reviens',
  'En vacances',
  'Absent du bureau',
  'Actuellement absent',
  'En pause',
  'Actuellement en pause',
  'Je reviens',
];

const processVacationResponses = async ({ parsedMessage, userToken, lead }) => {
  try {
    //check for availability of lead
    if (!lead) {
      logger.info(
        `Cannot check for out of office: This email is not from a lead`
      );
      return [null, 'Lead not found'];
    }
    //check for headers
    const headers = parsedMessage.headers;
    let flag;
    for (let key of Object.keys(MAIL_AUTO_RESPONSE_HEADERS))
      if (
        headers[MAIL_AUTO_RESPONSE_HEADERS[key]] ===
        MAIL_AUTO_RESPONSE_HEADER_VALUES[key]
      )
        flag = true;

    if (!flag) return ['Not an out office message', null];

    // find the In-Reply-To Mail
    // Find the list of mails with same sender and receiver and pick the latest one
    // using internalDate Attribute
    const timeDelta = ((parsedMessage.internalDate - 90000) / 1000).toFixed(0);
    const query = `in:sent from:${getEmailAddress(
      headers.to
    )} to:${getEmailAddress(headers.from)} after:${timeDelta}`;

    const [mails, errForMails] = await Mail.Inbox.getFromQuery(
      { refresh_token: userToken.google_refresh_token },
      query
    );

    if (errForMails || mails.length === 0) return [null, errForMails];

    const latestMail = mails.reduce((prevMail, currMail) =>
      prevMail.internalDate > currMail.internalDate ? prevMail : currMail
    );

    if (
      !latestMail ||
      getEmailAddress(latestMail.headers?.to) !==
        getEmailAddress(parsedMessage.headers?.from)
    )
      return [
        null,
        'No email sent to lead in last 1 minute, current email is not an out of office reply',
      ];
    // fetch latest email from db
    const [latestEmail, errorForLatestEmail] = await Repository.fetchOne({
      tableName: DB_TABLES.EMAIL,
      query: {
        message_id: latestMail.id,
      },
    });
    // check for keywords in the parsedMessage
    let content =
      parsedMessage?.headers?.subject
        .trim()
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '') +
      ' ' +
      parsedMessage?.textHtml
        ?.trim()
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');

    let keywordFlag = false;
    for (let phrase of OutOfOfficePhrases)
      if (
        content.includes(
          phrase
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
        )
      )
        keywordFlag = true;

    if (!keywordFlag) return ['Not an out office message', null];

    // At this stage, we have recognized an out of office email
    // Raise an out of office activity for this lead/contact
    const [activity, errorForActivity] =
      await ActivityHelper.createAndSendOutOfOfficeActivity({
        lead: lead,
        replied_mail: parsedMessage,
        sent_mail: latestMail,
        cadence_id: latestEmail.cadence_id,
        user: {
          user_id: lead.user_id,
        },
      });

    if (errorForActivity) return [null, errorForActivity];

    return ['Successfully processed out of office email', null];
  } catch (err) {
    logger.error(
      'An error occured while processing out of office responses',
      err
    );
    return [null, err];
  }
};

module.exports = processVacationResponses;
