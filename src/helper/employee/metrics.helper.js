// Utils
const { METRICS_FILTER } = require('../../utils/enums');

const getDateByTimezone = (date, timeZone) => {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone }));
};

const getPreviousDate = ({ before = 0, week, timezone = 'Asia/Kolkata' }) => {
  let today = new Date(getDateByTimezone(new Date(), timezone));
  const unixToday = new Date(today).setHours(0, 0, 0, 0);

  if (before === 0 && !week) {
    const unixTomorrow = new Date(today).setHours(24, 0, 0, 0) - 1;
    return [unixToday, unixTomorrow];
  } else if (before !== 0 && !week) {
    let lowerBound = new Date();
    lowerBound.setDate(today.getDate() - before);
    lowerBound = new Date(lowerBound).setHours(0, 0, 0, 0);
    return [
      new Date(lowerBound).setHours(0, 0, 0, 0),
      new Date(lowerBound).setHours(24, 0, 0, 0) - 1,
    ];
  } else if (week === METRICS_FILTER.THIS_WEEK) {
    return [
      new Date( // lowerbound
        new Date().setDate(today.getDate() - today.getDay() + 1)
      ).setHours(0, 0, 0, 0),
      new Date( // upperbound
        new Date().setDate(today.getDate() - today.getDay() + 7)
      ).setHours(24, 0, 0, 0) - 1,
    ];
  } else if (week === METRICS_FILTER.LAST_WEEK) {
    return [
      new Date( // lowerbound
        new Date().setDate(today.getDate() - today.getDay() - 7 + 1)
      ).setHours(0, 0, 0, 0),
      new Date(new Date().setDate(today.getDate() - today.getDay())).setHours(
        // upperbound
        24,
        0,
        0,
        0
      ) - 1,
    ];
  }
};
// console.log(getPreviousDate({ week: METRICS_FILTER.LAST_WEEK }));

const metricsFilterForLead = {
  [METRICS_FILTER.TODAY]: (timezone) =>
    getPreviousDate({ before: 0, timezone: timezone }),
  [METRICS_FILTER.YESTERDAY]: (timezone) =>
    getPreviousDate({ before: 1, timezone: timezone }),
  [METRICS_FILTER.THIS_WEEK]: (timezone) =>
    getPreviousDate({ week: METRICS_FILTER.THIS_WEEK, timezone: timezone }),
  [METRICS_FILTER.LAST_WEEK]: (timezone) =>
    getPreviousDate({ week: METRICS_FILTER.LAST_WEEK, timezone: timezone }),
};

const MetricsHelper = {
  getPreviousDate,
  metricsFilterForLead,
};

module.exports = MetricsHelper;
