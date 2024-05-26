// Utils
const { TRANSLATED_DAYS } = require('../../../utils/enums');

const translate = (variable_type, day) => {
  const en_weekday = TRANSLATED_DAYS.EN_WEEKDAY_CAPITAL;
  const fr_weekday = TRANSLATED_DAYS.FR_WEEKDAY;
  const es_weekday = TRANSLATED_DAYS.ES_WEEKDAY;
  const fr_weekday_capital = TRANSLATED_DAYS.FR_WEEKDAY_CAPITAL;
  const es_weekday_capital = TRANSLATED_DAYS.ES_WEEKDAY_CAPITAL;
  let weekday = '';
  switch (variable_type) {
    case TRANSLATED_DAYS.ENGLISH:
      weekday = `${en_weekday[day]}`;
      break;
    case TRANSLATED_DAYS.FRENCH:
      weekday = `${fr_weekday[day]}`;
      break;
    case TRANSLATED_DAYS.SPANISH:
      weekday = `${es_weekday[day]}`;
      break;
    case TRANSLATED_DAYS.ENGLISH_CAPITAL:
      weekday = `${en_weekday[day]}`;
      break;
    case TRANSLATED_DAYS.FRENCH_CAPITAL:
      weekday = `${fr_weekday_capital[day]}`;
      break;
    case TRANSLATED_DAYS.SPANISH_CAPITAL:
      weekday = `${es_weekday_capital[day]}`;
      break;
    default:
      weekday = '';
  }
  return weekday;
};

module.exports = translate;
