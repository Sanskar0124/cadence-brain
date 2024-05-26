/**
 * @param {string} timezone - timezone for which current date is required
 * @returns {Date} - current datetime for user timezone
 */
const getCurrentDateTimeForTimeZone = (timezone) => {
  // * If no timezone is specified
  if (!timezone) return null;
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
};

const workingDateNDaysFromNow = (days, timezone) => {
  let date = new Date();
  let day = date.getDay();

  date = new Date(date.getTime());
  date.setDate(
    date.getDate() +
      days +
      (day === 6 ? 2 : +!day) +
      Math.floor((days - 1 + (day % 6 || 1)) / 5) * 2
  );
  return date;
};
const workingDateNDaysAgo = (days, timezone) => {
  let date = new Date();
  let day = date.getDay();
  date = new Date(date.getTime());
  // date.setDate( date.getDate() + days + (day === 6 ? 2 : +!day) + Math.floor((days - 1 + (day % 6 || 1)) / 5) * 2 );
  date.setDate(
    date.getDate() -
      days -
      (day === 0 ? 2 : +!(day - 1)) -
      Math.floor((days - 1 + (day % 7 || 6)) / 7) * 2
  );
  return date;
};

/**
 *
 * @param {*} date - Number/String for Date
 * @param {string} timezone - Timezone to which the date needs to be converted
 * @returns {Date} - Date converted for that timezone
 */
const convertDateTimeToTimezone = (date, timezone) => {
  // * If no date is specifed
  if (!date) return getCurrentDateTimeForTimeZone(timezone);
  // * If no timezone is specified, return date
  if (!timezone) return new Date(date);
  return new Date(
    new Date(date).toLocaleString('en-US', { timeZone: timezone })
  );
};

/**
 *
 * @param {String} timezone - Valid timezone String
 * @returns {Number} - offset for the timezone i.e. by how many milli sec provided timezone is ahead/behind of current timezone
 */
const getTimezoneOffset = (timezone) => {
  const timestamp = new Date().getTime();

  let currentServerTimestamp = new Date(timestamp).getTime();
  const timezoneTimestamp = convertDateTimeToTimezone(
    timestamp,
    timezone
  ).getTime();
  // console.log(currentServerTimestamp, timezoneTimestamp);
  // console.log(getTimestampForDateOfTimezone(timestamp, timezone));

  const offset = timezoneTimestamp - currentServerTimestamp;

  // console.log(`Timezone offset: ${offset / (1000 * 60 * 60)}`);

  return offset;
};

/**
 *
 * @param {Number} timestamp - timestamp/Date Object of server
 * @param {String} timezone - timezone , whose offset needs to be added to the timestamp, to get that time in that timezone
 * @returns {Number} - timestamp that represents equivalent time as the timestamp passed, but for the timezone passed as an argument
 */
const addTimezoneOffset = (timestamp, timezone) => {
  let currentServerTimestamp = new Date(timestamp).getTime();
  const timezoneTimestamp = convertDateTimeToTimezone(
    timestamp,
    timezone
  ).getTime();
  // console.log(currentServerTimestamp, timezoneTimestamp);
  // console.log(getTimestampForDateOfTimezone(timestamp, timezone));

  const diff = currentServerTimestamp - timezoneTimestamp;

  // console.log(`Timezone offset: ${diff / (1000 * 60 * 60)}`);

  return currentServerTimestamp + diff;
};

/**
 *
 * @param {Number} hoursToSet - hour to set
 * @param {*} timestamp - timestamp for the day, from this day hours will be set
 * @param {*} timezone - timezone for which hours need to be set
 * @returns - timestamp of the time after setting hour for the timestamp passed in the given timezone
 */
const setHoursForTimezone = (hoursToSet, timestamp, timezone) => {
  /**
   * * Get the offset in mill sec
   * * Convert it to hours with 2 decimal precision
   * * Convert hours to mill sec
   *
   * * Reason for not using directly offset returned in mili sec,
   * * Paris time is ahead of GMT by 0.999... which is 1 hr, but in mill sec it will be 0.999... hr
   * * Due to this, 23:00 pm in GMT will be 23:59:59 pm for paris, after adding offset.
   * * To avoid this and to get 00:00 am, we convert 0.999...hr to 1 hr, then we use it as offset
   */
  const offset = getTimezoneOffset(timezone);
  const offSetInHours = (offset / (1000 * 60 * 60)).toFixed(2);

  // console.log(`Timezone offset in hours: ${offSetInHours}`);
  const offSetInMilliSec = offSetInHours * 60 * 60 * 1000;
  /**
   * * first add the offset to the timestamp so that we get the day/date in that timezone for the timestamp
   * * setHours which will set on the day/date according to local timezone, but since we have added the offset the day/date will be same as in the given timezone
   * * subtract the offset from the result of setHours to get the timestamp in given timezone for that time.
   */
  return (
    new Date(timestamp + offSetInMilliSec).setHours(hoursToSet, 0, 0, 0) -
    offSetInMilliSec
  );
};

// console.log(
//   setHoursForTimezone(-24, new Date().setHours(19, 0, 0, 0), 'Asia/Kolkata')
// );

/**
 *
 * @param {*} date - Date for server timezone
 * @param {String} timezone - Valid timezone
 * @returns {Number} - returns timestamp for the datetime, which will be passed as date for that timezone
 */

const getTimestampForDateOfTimezone = (date, timezone) => {
  // * date in that timezone
  const dateInTimezone = convertDateTimeToTimezone(date, timezone);
  const dateInServerTimezone = new Date(date);

  const timezoneOffset =
    dateInServerTimezone.getTime() - dateInTimezone.getTime();

  // console.log(
  //   `Timezone offset for ${timezone} with server in hours: ${(
  //     timezoneOffset /
  //     (1000 * 60 * 60)
  //   ).toFixed(2)}.`
  // );

  // console.log(
  //   `Timestamp for ${dateInTimezone.toLocaleString()} in ${timezone} is ${
  //     dateInTimezone.getTime() + timezoneOffset
  //   }`
  // );

  return dateInTimezone.getTime() + timezoneOffset;
};

/**
 *
 * @param {Number} hour - hour as passed to setHours
 * @param {*} date - date for the server
 * @param {*} timezone - Valid timezone
 * @returns {Number} - timestamp for that hour set in the passed timezone
 */
const convertToHour = (hour, date, timezone) => {
  // console.log(hour, date, timezone);
  // * convert hour to 24-hr format
  // hour = hour % 24;
  // console.log(hour);
  // * convert date for specified timezone
  const dateForTimezone = convertDateTimeToTimezone(date, timezone);
  // console.log(dateForTimezone.toLocaleString());
  // console.log(dateForTimezone.getTime());

  const dateForTimezoneTimestamp = getTimestampForDateOfTimezone(
    date,
    timezone
  );

  // console.log(dateForTimezoneTimestamp);

  // * get hours for date
  const hourForDate = dateForTimezone.getHours();
  // * get minutes for date
  const minutesForDate = dateForTimezone.getMinutes();
  // * get seconds for date
  const secondsForDate = dateForTimezone.getSeconds();

  const differenceInHours = hour - hourForDate;

  // console.log(
  //   `Hours for date: ${hourForDate}, Minutes for date: ${minutesForDate}, Seconds for date: ${secondsForDate}`
  // );

  // console.log(`Difference in hours: ${differenceInHours}.`);

  // * If hour to set is greater than hour for date
  // * e.g. hour=9, hourForDate=2
  if (differenceInHours > 0) {
    // console.log(
    //   `Difference in hours in positive, which means we need to add the difference in hours.`
    // );
    const factorInMilliSecToAdd =
      differenceInHours * 60 * 60 * 1000 -
      minutesForDate * 60 * 1000 -
      secondsForDate * 1000;
    // console.log(dateForTimezoneTimestamp + factorInMilliSecToAdd);
    // return convertDateTimeToTimezone(
    //   dateForTimezoneTimestamp + factorInMilliSecToAdd,
    //   timezone
    // );
    return dateForTimezoneTimestamp + factorInMilliSecToAdd;
  } else {
    // * If hour to set is less than hour for date
    // * e.g. hour=9, hourForDate=13

    // console.log(
    //   `Difference in hours in negative, which means we need to subtract the difference in hours.`
    // );
    const factorInMilliSecToAdd =
      differenceInHours * 60 * 60 * 1000 -
      minutesForDate * 60 * 1000 -
      secondsForDate * 1000;
    // console.log(dateForTimezoneTimestamp - factorInMilliSecToAdd);
    return dateForTimezoneTimestamp + factorInMilliSecToAdd;
  }
};

module.exports = {
  getCurrentDateTimeForTimeZone,
  convertDateTimeToTimezone,
  convertToHour,
  addTimezoneOffset,
  setHoursForTimezone,
  workingDateNDaysFromNow,
  workingDateNDaysAgo,
  getTimezoneOffset,
};
