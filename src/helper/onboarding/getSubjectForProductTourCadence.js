// Utils
const { USER_LANGUAGES } = require('../../utils/enums');

const SUBJECT = {
  [USER_LANGUAGES.ENGLISH]: `Invitation to Ringover Cadence`,
  [USER_LANGUAGES.FRENCH]: `Invitation à Ringover Cadence`,
  [USER_LANGUAGES.SPANISH]: `Invitación a Ringover Cadencia`,
};

/**
  Invitation mail subject
  @param {string} language  
  user's language
  enum to be used: USER_LANGUAGES 
 */
const getSubjectForOnboardingMail = ({ language }) => {
  if (!language) language = USER_LANGUAGES.ENGLISH;
  return SUBJECT?.[language] || 'Invitation to Ringover Cadence';
};

module.exports = getSubjectForOnboardingMail;
