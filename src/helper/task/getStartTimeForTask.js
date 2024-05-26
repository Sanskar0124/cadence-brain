// Utils
const logger = require('../../utils/winston');

// Repositories
const EmailSettingsRepository = require('../../repository/email-settings.repository');

// Helpers and services
const UserHelper = require('../user');
const getDateForTimezone = require('../user/getDateForTimezone');

// * returns time in milli sec for current day params
const getInMilliSec = ({ hour, min, sec }) => {
  if (hour) {
    return hour * 60 * 60 * 1000;
  } else if (min) {
    return min * 60 * 1000;
  } else if (sec) {
    return sec * 1000;
  }
  return 0;
};

const getDateFromMilliSec = (milliSec) => {
  const date = new Date(milliSec);
  return {
    day: date.getDay(),
    hour: date.getHours(),
  };
};

/**
 * @param { int } timezone - timezone of user
 * @param { int } delay - delay to add in minutes
 * @param { Sequelize.UUID } company_id - company_id of sales person
 * @param { int } startTime - startTime to be considered while calculating start_time for next task
 * @returns
 */
const getStartTimeForTask = async (
  timezone,
  delay,
  emailSettings,
  startTime
) => {
  try {
    if (!timezone) return [null, `Provide a timezone.`];
    let printConsoleLogs = false;

    // * fetch calendar_settings for company to which sales person belong
    // const [calendarSettings, errForCalendarSettings] =
    //   await CalendarSettingsRepository.getCalendarSettings({ company_id });
    //const [emailSettings, errForEmailSettings] =
    //await EmailSettingsRepository.getEmailSetting({ company_id });

    // * de-structuring
    // let { working_days, working_start_hour, working_end_hour } =
    //   calendarSettings;

    let {
      working_days,
      start_hour: working_start_hour,
      end_hour: working_end_hour,
    } = emailSettings;

    working_start_hour = parseInt(working_start_hour.split(':')[0]);
    working_end_hour = parseInt(working_end_hour.split(':')[0]);

    // * If startTime provided use that or else current time in milli seconds
    const currTimeInMilliSec = startTime || new Date().getTime();

    // * delay converted in milli seconds
    const delayInMilliSec = getInMilliSec({ min: delay });

    // * delayedTime to start in milli seconds
    const delayedTimeToStartInMilliSec = currTimeInMilliSec + delayInMilliSec;

    // * day for delayed time
    let delayedDay = getDateForTimezone
      .convertDateTimeToTimezone(delayedTimeToStartInMilliSec, timezone)
      .getDay();

    // * Since JS returns 0 for SUNDAY and we store MONDAY as 0 in our db, subtract 1 from value returned by JS
    delayedDay = delayedDay - 1 < 0 ? 6 : delayedDay - 1;

    if (printConsoleLogs) console.log({ delayedDay });

    // * working_start_hour in milli secs for today
    let workingStartHourInMilliSec = getDateForTimezone.setHoursForTimezone(
      working_start_hour,
      //currTimeInMilliSec,
      delayedTimeToStartInMilliSec,
      timezone
    );

    // * working_end_hour in milli secs for today
    let workingEndHourInMilliSec = getDateForTimezone.setHoursForTimezone(
      working_end_hour,
      //currTimeInMilliSec,
      delayedTimeToStartInMilliSec,
      timezone
    );

    // console.log(workingEndHourInMilliSec, workingStartHourInMilliSec);

    // * If delayed day is not today then change working start time and end time to that day
    if (
      getDateForTimezone
        .convertDateTimeToTimezone(delayedTimeToStartInMilliSec, timezone)
        .getDay() !==
      getDateForTimezone.getCurrentDateTimeForTimeZone(timezone).getDay()
    ) {
      workingStartHourInMilliSec = getDateForTimezone.setHoursForTimezone(
        working_start_hour,
        delayedTimeToStartInMilliSec,
        timezone
      );

      workingEndHourInMilliSec = getDateForTimezone.setHoursForTimezone(
        working_end_hour,
        delayedTimeToStartInMilliSec,
        timezone
      );
      // console.log(workingEndHourInMilliSec, workingStartHourInMilliSec);
    }

    /**
     * * Depending on value of delayedTimeToStart, we can have 3 cases
     *
     * * CASE 1: It lies within working hours
     * * CASE 2: It can be after the working_end_hour. Here, make it as working_start_hour for next day
     * * CASE 3: It can be before the working_start_hour. Here, make it as working_start_hour for same day
     *
     * * If any time falls on non-working day, set is as working_start_hour of nearest working_day
     */
    if (printConsoleLogs) {
      console.log(
        'start_time',
        startTime,
        new Date(startTime).toLocaleString(),
        'curr_time',
        currTimeInMilliSec,
        new Date(currTimeInMilliSec).toLocaleString(),
        'delayed time',
        delayedTimeToStartInMilliSec,
        new Date(delayedTimeToStartInMilliSec).toLocaleString(),
        'working end',
        new Date(workingEndHourInMilliSec).toLocaleString(),
        workingEndHourInMilliSec,
        'working start',
        new Date(workingStartHourInMilliSec).toLocaleString(),
        workingStartHourInMilliSec
      );
    }

    // * If it is not a working day or calculatedTime is greater than workingEndHourInMilliSec or calculatedTime is less than workingStartHourInMilliSec
    if (
      !working_days[delayedDay] ||
      delayedTimeToStartInMilliSec <= workingStartHourInMilliSec ||
      delayedTimeToStartInMilliSec >= workingEndHourInMilliSec
    ) {
      if (printConsoleLogs) console.log('shold come here');
      // * Find next nearest working day

      // * start from delayedDay index
      let index = delayedDay;

      // * Since we start from delayedDay index
      let delayInDays = 0;

      // * Number of milliseconds in one day
      const ONE_DAY = 1000 * 60 * 60 * 24;

      // * calculate difference in days between
      const diffInDays = Math.round(
        Math.abs(delayedTimeToStartInMilliSec - currTimeInMilliSec) / ONE_DAY
      );

      if (printConsoleLogs) {
        console.log({
          diff: Math.abs(delayedTimeToStartInMilliSec - currTimeInMilliSec),
        });
        console.log({
          delaydate: new Date(delayedTimeToStartInMilliSec)
            .toISOString()
            .slice(0, 10),
          current: new Date(currTimeInMilliSec).toISOString().slice(0, 10),
        });
        console.log({ oneday: ONE_DAY });
        console.log({ diffInDays });
        console.log({
          beforeround:
            Math.abs(delayedTimeToStartInMilliSec - currTimeInMilliSec) /
            ONE_DAY,
        });
        console.log(
          new Date(delayedTimeToStartInMilliSec).toLocaleString('en-US', {
            timeZone: timezone,
          }),
          new Date(workingEndHourInMilliSec).toLocaleString('en-US', {
            timeZone: timezone,
          })
        );
      }

      /**
       * * If it is not a working day or calculatedTime is greater than workingEndHourInMilliSec
       * * In both case, calculated time will be start time for next nearest working day
       *
       */
      if (
        !working_days[delayedDay] ||
        delayedTimeToStartInMilliSec >= workingEndHourInMilliSec
      ) {
        if (printConsoleLogs) console.log('but came now here');
        index = delayedDay + 1;

        // * delayInDays will be diffInDays + 1 because its past workingEndHourInMilliSec and hence we will start from next day
        //delayInDays = diffInDays + 1;
        delayInDays = 1;
      } else {
        /**
         * * calculatedTime is less than workingStartHourInMilliSec
         * * calculated time can be start time of that day if it is working day and if it not a working day it will be start time for next nearest working day
         */
        if (printConsoleLogs) console.log('now here');
        index = delayedDay;

        // * no + 1 here since its bound for that day only
        delayInDays = diffInDays;
        delayInDays = 0;
      }

      if (printConsoleLogs) console.log({ delayInDays });

      while (true) {
        // * If index exceeds 6, start from beginning of array
        if (index > 6) {
          index = 0;
        }

        if (working_days[index]) {
          // * If found, we have our delayInDays
          break;
        }

        // * If not found, increment index and delayInDays
        index += 1;
        delayInDays += 1;
      }

      if (printConsoleLogs) console.log({ delayInDays });

      const delayInHours = delayInDays * 24 + working_start_hour;

      /**
       * * using delayedTimeToStartInMilliSec as base for date instead of current time because startTime
       * * can be passed which can be for other day.
       */

      // console.log(
      // getDateForTimezone.setHoursForTimezone(
      //   delayInHours,
      //   delayedTimeToStartInMilliSec,
      //   timezone
      // );
      // );

      return getDateForTimezone.setHoursForTimezone(
        delayInHours,
        delayedTimeToStartInMilliSec,
        timezone
      );
    }

    //console.log(delayedTimeToStartInMilliSec);
    return delayedTimeToStartInMilliSec;
  } catch (err) {
    // console.log(err);
    logger.error(
      `Error while calculating start time for task: ${err.message}.`
    );
    return [null, err.message];
  }
};

//(async function test() {
//console.log('hi');

//const t = await getStartTimeForTask(
//'Europe/Paris',
//18 * 60,
//{
//at_settings_id: 1,
//working_days: [1, 1, 1, 1, 1, 0, 0],
//start_hour: '09:00',
//end_hour: '18:00',
//company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
//sd_id: null,
//user_id: null,
//priority: 3,
//max_sms_per_day: 100,
//is_wait_time_random: 1,
//wait_time_upper_limit: 420,
//wait_time_lower_limit: 120,
//delay: 4,
//max_emails_per_day: 100,
//},
//new Date().getTime()
//);
//console.log(t);
//})();

module.exports = getStartTimeForTask;
