// Utils
const { USER_LANGUAGES } = require('../utils/enums');

const TRANSLATIONS = {
  GET_STARTED_WITH_CADENCE: {
    [USER_LANGUAGES.ENGLISH]: 'Get started with Cadence',
    [USER_LANGUAGES.FRENCH]: 'Commencez avec Cadence',
    [USER_LANGUAGES.SPANISH]: 'Comienza con Cadence',
  },
  HI: {
    [USER_LANGUAGES.ENGLISH]: 'Hi',
    [USER_LANGUAGES.FRENCH]: 'Bonjour',
    [USER_LANGUAGES.SPANISH]: 'Hola',
  },
  YOU_HAVE_BEEN_INVITED: {
    [USER_LANGUAGES.ENGLISH]:
      'You have been invited to join Cadence by Ringover',
    [USER_LANGUAGES.FRENCH]:
      'Vous avez été invité à rejoindre Cadence par Ringover',
    [USER_LANGUAGES.SPANISH]: 'Ringover te ha invitado a unirte a Cadence',
  },
  KINDLY_CLICK_ON_BUTTON: {
    [USER_LANGUAGES.ENGLISH]:
      'Kindly click on the button below to get started with your cadence acccount',
    [USER_LANGUAGES.FRENCH]:
      'Veuillez cliquer sur le bouton ci-dessous pour démarrer avec votre compte Cadence',
    [USER_LANGUAGES.SPANISH]:
      'Para comenzar con tu cuenta de Cadence, haz clic en el botón de abajo',
  },
  JOIN_CADENCE: {
    [USER_LANGUAGES.ENGLISH]: 'Join Cadence',
    [USER_LANGUAGES.FRENCH]: 'Rejoignez Cadence',
    [USER_LANGUAGES.SPANISH]: 'Únete a Cadence',
  },
  SEE_YOU_SOON: {
    [USER_LANGUAGES.ENGLISH]: 'See you soon',
    [USER_LANGUAGES.FRENCH]: 'À bientôt',
    [USER_LANGUAGES.SPANISH]: 'Hasta Pronto',
  },
  THE_CADENCE_TEAM: {
    [USER_LANGUAGES.ENGLISH]: 'The Cadence team',
    [USER_LANGUAGES.FRENCH]: "L'équipe Cadence",
    [USER_LANGUAGES.SPANISH]: 'El equipo Cadence',
  },
  HAS_INVITED_YOU: {
    [USER_LANGUAGES.ENGLISH]: 'has invited you to join Cadence by Ringover',
    [USER_LANGUAGES.FRENCH]: 'vous a invité à rejoindre Cadence by Ringover',
    [USER_LANGUAGES.SPANISH]: 'te ha invitado a unirte a Cadence by Ringover',
  },
};

module.exports = TRANSLATIONS;
