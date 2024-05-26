// Utils
const logger = require('../utils/winston');

// Models
const { Op } = require('sequelize');
const { Calendar_Settings } = require('../db/models');

const createCalendarSettings = async (calendarSettings) => {
  try {
    const data = await Calendar_Settings.create(calendarSettings);
    return [data, null];
  } catch (err) {
    console.log(err.errors);
    return [null, 'Error while creating Calendar settings.'];
  }
};

const getCalendarSettings = async (query) => {
  try {
    const data = await Calendar_Settings.findOne({
      where: query,
    });
    if (!data) {
      return [null, 'No calendar settings found for given query.'];
    }
    return [JSON.parse(JSON.stringify(data)), null];
  } catch (err) {
    logger.error(err.message);
    return [null, 'Error occured while fetching calendar settings.'];
  }
};

const updateCalendarSettings = async (user_id, calendarSettings) => {
  try {
    await Calendar_Settings.update(calendarSettings, {
      where:
        user_id === null
          ? { company_id: calendarSettings.company_id }
          : { user_id },
    });
    return ['Updated successfully.', null];
  } catch (err) {
    logger.error(err.message);
    return [null, 'Error while updating Calendar Settings.'];
  }
};

const updateAllCalendarSettings = async (calendarSettings) => {
  try {
    await Calendar_Settings.update(calendarSettings, {
      where: {
        [Op.not]: [
          {
            cs_id: 0,
          },
        ],
      },
    });
    return ['Everyone calendar settings updated successfully.', null];
  } catch (err) {
    logger.error(err.message);
    return [null, 'Error while updating Calendar Settings.'];
  }
};

const deleteCalendarSettings = async (query) => {
  try {
    await Calendar_Settings.destroy({
      where: query,
    });
    return ['Deleted successfully.', null];
  } catch (err) {
    logger.error(err.message);
    return [null, 'Error while deleting calendar settings.'];
  }
};

const CalendarSettingsRepository = {
  createCalendarSettings,
  getCalendarSettings,
  updateCalendarSettings,
  updateAllCalendarSettings,
  deleteCalendarSettings,
};

module.exports = CalendarSettingsRepository;
