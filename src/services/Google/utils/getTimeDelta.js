const { CALENDAR_TIMEFRAME, CALENDAR_OFFSET } = require('../../../utils/enums');
const logger = require('../../../utils/winston');
/**
 * @description generate fromTime and toTime in UTC in rfc3339 format
 * @param {string} timeFrame - enum {day, week, month}
 * @param {string} format - enum {start, pivot, end}
 * @returns {[{ startDate: Date, endDate: Date }], err: string}
 */
const getTimeDelta = ({ timeFrame, dateNow, offset }) => {
  try {
    dateNow = dateNow ? new Date(dateNow) : new Date();
    let startDate, endDate;
    switch (timeFrame) {
      case CALENDAR_TIMEFRAME.DAY: {
        startDate = new Date(
          dateNow.getFullYear(),
          dateNow.getMonth(),
          dateNow.getDate(),
          0,
          0,
          0,
          0
        );
        endDate = new Date(
          dateNow.getFullYear(),
          dateNow.getMonth(),
          dateNow.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      }
      case CALENDAR_TIMEFRAME.WEEK: {
        startDate = new Date(
          dateNow.getFullYear(),
          dateNow.getMonth(),
          dateNow.getDate() - 7,
          0,
          0,
          0,
          0
        );
        endDate = new Date(
          dateNow.getFullYear(),
          dateNow.getMonth(),
          dateNow.getDate() + 7,
          23,
          59,
          59,
          999
        );
        break;
      }
      case CALENDAR_TIMEFRAME.MONTH: {
        startDate = new Date(
          dateNow.getFullYear(),
          dateNow.getMonth() - 1,
          dateNow.getDate(),
          0,
          0,
          0,
          0
        );
        endDate = new Date(
          dateNow.getFullYear(),
          dateNow.getMonth() + 1,
          dateNow.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      }
    }
    // format can be start, pivot, end
    switch (offset) {
      case CALENDAR_OFFSET.START: {
        startDate = dateNow;
        break;
      }
      case CALENDAR_OFFSET.END: {
        endDate = dateNow;
        break;
      }
    }
    return [
      {
        startDate,
        endDate,
      },
      null,
    ];
  } catch (err) {
    logger.error('Error occured while finding timeDelta', err);
    return [null, err];
  }
};

module.exports = getTimeDelta;
