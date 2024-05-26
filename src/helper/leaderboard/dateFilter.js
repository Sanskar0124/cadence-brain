// Packages
const moment = require('moment-timezone');

// Utils
const { LEADERBOARD_DATE_FILTERS } = require('../../utils/enums');

// Helpers and services
const { setHoursForTimezone } = require('../user/getDateForTimezone');

const getDateByTimezone = (date, timeZone) => {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone }));
};

// * all parameters are for past
/**
 *
 * @param {*} * all parameters are for past
 *
 * will return an array of length 2 having upper and lower unix timestamps for date range
 */
const dateFilter = ({ before, week, month, timezone = 'Asia/Kolkata' }) => {
  let today = new Date(getDateByTimezone(new Date(), timezone));
  const unixToday = setHoursForTimezone(0, new Date().getTime(), timezone);

  if (before === 0 && week === undefined && month === undefined) {
    const unixTomorrow =
      setHoursForTimezone(24, new Date().getTime(), timezone) - 1000;
    return [unixToday, unixTomorrow];
  } else if (before !== 0 && week === undefined && month === undefined) {
    const lowerBound = setHoursForTimezone(
      -(24 * before),
      new Date().getTime(),
      timezone
    );
    const upperBound =
      setHoursForTimezone(
        -(24 * (before - 1)),
        new Date().getTime(),
        timezone
      ) - 1000;
    return [lowerBound, upperBound];
  } else if (week === LEADERBOARD_DATE_FILTERS.LAST_WEEK) {
    return [
      setHoursForTimezone(
        24,
        new Date(
          new Date().setDate(today.getDate() - today.getDay() - 7)
        ).getTime(),
        timezone
      ),
      setHoursForTimezone(
        24,
        new Date(
          new Date().setDate(today.getDate() - today.getDay())
        ).getTime(),
        timezone
      ) - 1000,
    ];
  } else if (week === LEADERBOARD_DATE_FILTERS.THIS_WEEK) {
    return [
      setHoursForTimezone(
        0,
        new Date(
          new Date().setDate(today.getDate() - today.getDay() + 1)
        ).getTime(),
        timezone
      ),
      setHoursForTimezone(
        24,
        new Date(
          new Date().setDate(today.getDate() - today.getDay() + 7)
        ).getTime(),
        timezone
      ) - 1000,
    ];
  } else if (month === LEADERBOARD_DATE_FILTERS.LAST_MONTH) {
    // * to store firstDayOfLastMonth
    let firstDayOfLastMonth = new Date();
    // * setting date to 1
    firstDayOfLastMonth.setDate(1);
    // * setting month as previous month
    firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);
    // * setting time to start of day
    firstDayOfLastMonth = setHoursForTimezone(
      0,
      firstDayOfLastMonth.getTime(),
      timezone
    );

    const currentDateTime = moment().tz(timezone);

    // Get the last day of the previous month
    const lastDayOfLastMonth = currentDateTime
      .subtract(1, 'months')
      .endOf('month');

    const epochTimestamp = lastDayOfLastMonth.valueOf();

    return [firstDayOfLastMonth, epochTimestamp];
  } else if (month === LEADERBOARD_DATE_FILTERS.THIS_MONTH) {
    // * to store firstDayOfLastMonth
    let firstDayOfLastMonth = new Date();
    // * setting date to 1
    firstDayOfLastMonth.setDate(1);
    // * setting time to start of day
    firstDayOfLastMonth = setHoursForTimezone(
      0,
      firstDayOfLastMonth.getTime(),
      timezone
    );

    // * to store lastDayOfLastMonth
    let lastDayOfLastMonth = new Date();
    // * setting date to first date of this month
    lastDayOfLastMonth.setDate(1);
    // * setting month as next month
    lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth() + 1);
    // * setting date to last day of previous month
    lastDayOfLastMonth.setDate(0);
    // * setting time to start of day
    lastDayOfLastMonth = setHoursForTimezone(
      24,
      lastDayOfLastMonth.getTime(),
      timezone
    );
    lastDayOfLastMonth -= 1000;
    // lastDayOfLastMonth = new Date(lastDayOfLastMonth.getTime() - 1);
    return [
      firstDayOfLastMonth,
      lastDayOfLastMonth,
      // UserHelper.setHoursForTimezone(0, firstDayOfLastMonth, timezone),
      // UserHelper.setHoursForTimezone(24, lastDayOfLastMonth, timezone),
    ];
  } else if (month === LEADERBOARD_DATE_FILTERS.LAST_3_MONTHS) {
    // * to store firstDayOfLastMonth
    let firstDayOfThirdLastMonth = new Date();
    // * setting date to 1
    firstDayOfThirdLastMonth.setDate(1);
    // * setting month as previous month
    firstDayOfThirdLastMonth.setMonth(firstDayOfThirdLastMonth.getMonth() - 3);
    // * setting time to start of day
    firstDayOfThirdLastMonth = setHoursForTimezone(
      0,
      firstDayOfThirdLastMonth.getTime(),
      timezone
    );

    // * to store lastDayOfLastMonth
    let lastDayOfLastMonth = new Date();
    // * setting date to last date of previous month
    lastDayOfLastMonth.setDate(0);
    // * setting month as previous month
    // lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth() - 1);
    // * setting time to start of day
    lastDayOfLastMonth.setHours(24, 0, 0, 0);
    lastDayOfLastMonth = new Date(lastDayOfLastMonth.getTime() - 1);
    lastDayOfLastMonth = setHoursForTimezone(
      24,
      lastDayOfLastMonth.getTime(),
      timezone
    );
    lastDayOfLastMonth -= 1000;
    return [firstDayOfThirdLastMonth, lastDayOfLastMonth];
  } else if (month === LEADERBOARD_DATE_FILTERS.LAST_6_MONTHS) {
    // * to store firstDayOfLastMonth
    let firstDayOfThirdLastMonth = new Date();
    // * setting date to 1
    firstDayOfThirdLastMonth.setDate(1);
    // * setting month as previous month
    firstDayOfThirdLastMonth.setMonth(firstDayOfThirdLastMonth.getMonth() - 6);
    // * setting time to start of day
    firstDayOfThirdLastMonth = setHoursForTimezone(
      0,
      firstDayOfThirdLastMonth.getTime(),
      timezone
    );

    // * to store lastDayOfLastMonth
    let lastDayOfLastMonth = new Date();
    // * setting date to last date of previous month
    lastDayOfLastMonth.setDate(0);
    // * setting month as previous month
    // lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth() - 1);
    // * setting time to start of day
    lastDayOfLastMonth.setHours(24, 0, 0, 0);
    lastDayOfLastMonth = new Date(lastDayOfLastMonth.getTime() - 1);
    lastDayOfLastMonth = setHoursForTimezone(
      24,
      lastDayOfLastMonth.getTime(),
      timezone
    );
    lastDayOfLastMonth -= 1000;
    return [firstDayOfThirdLastMonth, lastDayOfLastMonth];
  }
};
// dateFilter({
//   month: LEADERBOARD_DATE_FILTERS.THIS_MONTH,
//   timezone: 'Europe/Paris',
// }).map((date) =>
//   console.log(
//     date,
//     chalk.yellow(new Date(date).toString()),
//     new Date(date).toISOString().slice(0, 19).replace('T', ' ')
//   )
// );

const dateFilters = {
  [LEADERBOARD_DATE_FILTERS.TODAY]: (timezone) =>
    dateFilter({ before: 0, timezone }),
  [LEADERBOARD_DATE_FILTERS.YESTERDAY]: (timezone) =>
    dateFilter({ before: 1, timezone }),
  [LEADERBOARD_DATE_FILTERS.THIS_WEEK]: (timezone) =>
    dateFilter({
      week: LEADERBOARD_DATE_FILTERS.THIS_WEEK,
      timezone,
    }),
  [LEADERBOARD_DATE_FILTERS.LAST_WEEK]: (timezone) =>
    dateFilter({
      week: LEADERBOARD_DATE_FILTERS.LAST_WEEK,
      timezone,
    }),
  [LEADERBOARD_DATE_FILTERS.THIS_MONTH]: (timezone) =>
    dateFilter({
      month: LEADERBOARD_DATE_FILTERS.THIS_MONTH,
      timezone,
    }),
  [LEADERBOARD_DATE_FILTERS.LAST_MONTH]: (timezone) =>
    dateFilter({
      month: LEADERBOARD_DATE_FILTERS.LAST_MONTH,
      timezone,
    }),
  [LEADERBOARD_DATE_FILTERS.LAST_3_MONTHS]: (timezone) =>
    dateFilter({
      month: LEADERBOARD_DATE_FILTERS.LAST_3_MONTHS,
      timezone,
    }),
  [LEADERBOARD_DATE_FILTERS.LAST_6_MONTHS]: (timezone) =>
    dateFilter({
      month: LEADERBOARD_DATE_FILTERS.LAST_6_MONTHS,
      timezone,
    }),
};

module.exports = { dateFilter, dateFilters };
