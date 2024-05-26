// Utils
const logger = require('../../utils/winston');

// Repositories
const CalendarSettingsRepository = require('../../repository/calendar-settings.repository');

const getAvgTimeTillFirstCall = async (lead) => {
  try {
    let totalMinutes = 0;
    // * Function to add hours
    Date.prototype.addHours = function (h) {
      this.setHours(this.getUTCHours() + h);
      return this;
    };

    // * Function to add days
    function addDays(theDate, days) {
      return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
    }

    console.log('Logging user id: ');
    console.log(lead.user_id);

    /* Get salesperson calendar settings */
    let calendarSettings = await CalendarSettingsRepository.getCalendarSettings(
      {
        user_id: lead.user_id,
      }
    );

    console.log('Calendar settings...');
    console.log(calendarSettings);

    let {
      working_days,
      working_start_hour,
      working_end_hour,
      break_start_time,
      break_end_time,
    } = calendarSettings[0];

    let activityTime = new Date(); // Current time is the activity time
    let assignedTime = new Date(lead.assigned_time);

    /* LOGIC TO HANDLE WORKING DAYS WORKING HOURS AND BREAK TIME */

    /*
			- If the lead is assigned on a non working day, modify assigning time to the next working day's working time.
		  - If the lead is assigned earlier than the working time on a working day, modify time to working time start.
		  - If the lead is assigned on a working day, but after working hours, modify assign time to next working day's working time.

		*/

    /*
			 Date object returns Sun as 0, while we store Monday as 0.
		  Hence, 
		  0 (from date object) = 6 in db
			1 (from date object) = 0 in db
		  2 (from date object) = 1 in db
		  3 (from date object) = 2 in db
		  4 (from date object) = 3 in db
		  5 (from date object) = 4 in db
		  6 (from date object) = 5 in db

	  */

    try {
      let calculatedAssignedDay =
        assignedTime.getDay() - 1 < 0 ? 6 : assignedTime.getDay() - 1;

      // Check if the assignedDay is a working day
      if (working_days[calculatedAssignedDay]) {
        logger.info('Assigned on a working day');
        // Check if it has been assigned within the working hours
        // Checking if before working hours
        if (
          parseInt(assignedTime.getUTCHours()) <
          parseInt(working_start_hour.split(':')[0])
        ) {
          logger.info(
            'The lead was assigned on a working day, but too early. Modifying the time.'
          );
          // Setting time to working time
          assignedTime.setUTCHours(
            parseInt(working_start_hour.split(':')[0]),
            0,
            0
          );
        }
        // Checking if after working hours
        else if (
          parseInt(assignedTime.getUTCHours()) >
          parseInt(working_end_hour.split(':')[0])
        ) {
          logger.info(
            'The lead was assigned on a working day, but too late. Modifying the time to next available working.'
          );

          let foundDay = false;
          let potentialFoundDay = calculatedAssignedDay;
          let addedDays = 1;
          while (!foundDay) {
            potentialFoundDay = potentialFoundDay + 1;
            if (potentialFoundDay > 6) {
              // Since uper limit is 6
              potentialFoundDay = 0;
            }
            if (working_days[potentialFoundDay]) {
              foundDay = true;
            } else {
              addedDays = addedDays + 1;
            }
          }

          assignedTime = addDays(assignedTime, addedDays); // Adding days
          assignedTime.setUTCHours(
            parseInt(working_start_hour.split(':')[0]),
            0,
            0
          );
        }
        // Checking if during break time
        else if (
          parseInt(break_start_time.split(':')[0]) <=
            assignedTime.getUTCHours() &&
          parseInt(break_end_time.split(':')[0]) >= assignedTime.getUTCHours()
        ) {
          logger.info('Lead assigned during break time...');
          assignedTime.setUTCHours(
            parseInt(break_end_time.split(':')[0]),
            parseInt(break_end_time.split(':')[1]),
            0
          );
        }
      } else {
        /* Lead assigned not on a working day! */
        logger.info('Finding the next working day...');
        let foundDay = false;
        let potentialFoundDay = calculatedAssignedDay;
        let addedDays = 1;
        while (!foundDay) {
          potentialFoundDay = potentialFoundDay + 1;
          if (potentialFoundDay > 6) {
            // Since uper limit is 6
            potentialFoundDay = 0;
          }
          if (working_days[potentialFoundDay]) {
            foundDay = true;
          } else {
            addedDays = addedDays + 1;
          }
        }
        assignedTime = addDays(assignedTime, addedDays); // Adding days
        assignedTime.setUTCHours(
          parseInt(working_start_hour.split(':')[0]),
          0,
          0
        ); // Setting to working start time.
      }
    } catch (err) {
      logger.error(
        `Error while getting avg time to first call: ${err.message}`
      );
    }

    logger.info(
      'Difference in minutes: ' +
        Math.floor(Math.abs((activityTime - assignedTime) / 1000) / 60)
    );

    // Updating total time difference
    totalMinutes =
      Math.floor(Math.abs((activityTime - assignedTime) / 1000) / 60) +
      totalMinutes;
    return [totalMinutes, null];
  } catch (err) {
    logger.error(`Error while updating avg time till first call: `, err);
    return [null, err.message];
  }
};

module.exports = getAvgTimeTillFirstCall;
