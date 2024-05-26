// Utils
const { AGENDA_FILTERS } = require('../../utils/enums');

const getDateByTimezone = (date, timeZone) => {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone }));
};

// helper function
const getDate = ({ after = 0, week, timezone = 'Asia/Kolkata' }) => {
  // const today = new Date();
  let today = new Date(getDateByTimezone(new Date(), timezone));
  const unixToday = new Date(today).setHours(0, 0, 0, 0);
  if (after === 0 && week === undefined) {
    const unixTomorrow = new Date(today).setHours(24, 0, 0, 0) - 1;
    return [unixToday, unixTomorrow];
  } else if (after !== 0 && week === undefined) {
    const lowerBound = new Date(today).setHours(24 * after, 0, 0, 0);
    const upperBound = new Date(today).setHours(24 * (after + 1), 0, 0, 0) - 1;
    return [lowerBound, upperBound];
  } else if (week === AGENDA_FILTERS.THIS_WEEK) {
    return [
      unixToday, // today's date, not starting from actual startOfTheWeek because we dont want old agendas
      new Date(
        new Date().setDate(today.getDate() - today.getDay() + 7)
      ).setHours(24, 0, 0, 0) - 1,
    ];
  } else if (week === AGENDA_FILTERS.NEXT_WEEK) {
    return [
      new Date(
        new Date().setDate(today.getDate() - today.getDay() + 8)
      ).setHours(0, 0, 0, 0), // startOfTheWeek
      new Date(
        new Date().setDate(today.getDate() - today.getDay() + 14)
      ).setHours(24, 0, 0, 0) - 1, // endOfTheWeek
    ];
  }
};
// getDate({week: AGENDA_FILTERS.NEXT_WEEK,timezone: "Asia/Kolkata"}).map((date) =>
// console.log(new Date(date).toString())
// );
const AgendaHelper = {
  getDate,
};

module.exports = AgendaHelper;
