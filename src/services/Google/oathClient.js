// * Package imports
const { google } = require('googleapis');

// * Utils
const config = require('../../utils/config');
const { MAIL_SCOPE_LEVEL } = require('../../utils/enums');

const { GOOGLE_OAUTH_STANDARD, GOOGLE_OAUTH_ADVANCE } = config;

// * Advanced scopes for Google
const GMAIL_SCOPES_ADVANCED = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];
const CALENDAR_SCOPES_ADVANCED = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
];
const SCOPES_ADVANCE = [...GMAIL_SCOPES_ADVANCED, ...CALENDAR_SCOPES_ADVANCED];

// * Standard scopes for Google
const GMAIL_SCOPES_STANDARD = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.send',
];
const CALENDAR_SCOPES_STANDARD = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
];
const SCOPES_STANDARD = [...GMAIL_SCOPES_STANDARD, ...CALENDAR_SCOPES_STANDARD];

const getOauth2Client = (email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE) => {
  // * Return different google auth instance based on (email_scope_level)
  switch (email_scope_level) {
    case MAIL_SCOPE_LEVEL.STANDARD:
      // * Standard google auth
      return new google.auth.OAuth2(
        GOOGLE_OAUTH_STANDARD.CLIENT_ID,
        GOOGLE_OAUTH_STANDARD.CLIENT_SECRET,
        GOOGLE_OAUTH_STANDARD.REDIRECT_URL
      );
    case MAIL_SCOPE_LEVEL.ADVANCE:
      // * Advance google auth
      return new google.auth.OAuth2(
        GOOGLE_OAUTH_ADVANCE.CLIENT_ID,
        GOOGLE_OAUTH_ADVANCE.CLIENT_SECRET,
        GOOGLE_OAUTH_ADVANCE.REDIRECT_URL
      );
    default:
      logger.error(
        `[getOauth2Client] : No email scope received. Received : ${email_scope_level}`
      );
      return new google.auth.OAuth2(
        GOOGLE_OAUTH_ADVANCE.CLIENT_ID,
        GOOGLE_OAUTH_ADVANCE.CLIENT_SECRET,
        GOOGLE_OAUTH_ADVANCE.REDIRECT_URL
      );
  }
};

const generateAuthUrl = (
  email,
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE
) => {
  const oauth2Client = getOauth2Client(email_scope_level);

  let SCOPES = [];
  // * Return different scopes based on (email_scope_level)
  switch (email_scope_level) {
    case MAIL_SCOPE_LEVEL.STANDARD:
      // * Standard google scopes
      SCOPES = SCOPES_STANDARD;
      break;
    case MAIL_SCOPE_LEVEL.ADVANCE:
      // * Advance google scopes
      SCOPES = SCOPES_ADVANCE;
      break;
    default:
      logger.error(
        `[generateAuthUrl] : No email scope received. Received : ${email_scope_level}`
      );
      SCOPES = SCOPES_ADVANCE;
      break;
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    login_hint: email,
    prompt: 'consent',
  });
  return url;
};

const getTokens = async (
  code,
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE
) => {
  try {
    const oauth2Client = getOauth2Client(email_scope_level);
    code = decodeURIComponent(code);
    const { tokens } = await oauth2Client.getToken(code);
    return [tokens, null];
  } catch (err) {
    console.error(err);
    return [null, err.message];
  }
};

const revokeToken = async (
  refresh_token,
  email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE
) => {
  const oauth2Client = getOauth2Client(email_scope_level);
  const result = await oauth2Client.revokeToken(refresh_token);
  if (result.status === 200) {
    return [true, null];
  }
  return [null, result.statusText];
};

/**
 * @param {Object} token
 * @param {String} email_scope_level
 * @description
 * @returns oauth2Client
 */
const get = (token, email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE) => {
  try {
    const oauth2Client = getOauth2Client(email_scope_level);
    oauth2Client.setCredentials(token);
    return oauth2Client;
  } catch (error) {}
};

const signout = async (token, email_scope_level = MAIL_SCOPE_LEVEL.ADVANCE) => {
  try {
    const oauth2Client = get(token, email_scope_level);
    const result = await oauth2Client.revokeToken(token);
    return result;
  } catch (e) {
    return [null, e.message];
  }
};
const oauth2Client = {
  generateAuthUrl,
  getTokens,
  get,
  revokeToken,
  signout,
};

module.exports = oauth2Client;
