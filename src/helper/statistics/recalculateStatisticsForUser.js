// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const {
  NODE_TYPES,
  LEADERBOARD_DATE_FILTERS,
  CADENCE_STATUS,
  LEAD_STATUS,
  CADENCE_LEAD_STATUS,
  CUSTOM_TASK_NODE_ID,
  AUTOMATED_NODE_TYPES_ARRAY,
} = require('../../utils/enums');

//Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// Helpers
const LeaderboardHelper = require('../../helper/leaderboard');
const getTaskArrayForTable = require('./getTaskArrayForTable');
const getStatusArrayForTable = require('./getStatusArrayForTable');

const recalculateStatisticsForUser = async ({ company_id, timezone }) => {
  // Get the current date and time in the specified timezone
  const now = new Date().toLocaleString('en-US', {
    timeZone: timezone,
  });

  // Create a new date object using the current date and time in the specified timezone
  const date = new Date(now);

  // Check if the calculated stats are of same day
  const [storedStats, errForStoredStats] = await Repository.fetchOne({
    tableName: DB_TABLES.STATISTICS_STORE,
    query: {
      company_id,
      timezone,
    },
  });
  if (errForStoredStats)
    logger.error(
      `Error while fetching stored statistics for company_id : ${company_id} and tz: ${timezone} `
    );

  if (storedStats) {
    const createdAt = new Date(storedStats.created_at).toLocaleString('en-US', {
      timeZone: timezone,
    });

    const createdDate = new Date(createdAt);

    if (createdDate.getDate() == date.getDate())
      return ['Finished processing.', null];
  }

  // Calculate stats for timezone
  const [deleteOldStats, errForDelete] = await Repository.destroy({
    tableName: DB_TABLES.STATISTICS_STORE,
    query: {
      company_id: company_id,
      timezone: timezone,
    },
  });
  if (errForDelete) {
    logger.error(
      `Error while deleting old data for ${company_id}, ${timezone}: `,
      errForDelete
    );
  }

  const [deleteOldStatusStats, errForStatusDelete] = await Repository.destroy({
    tableName: DB_TABLES.STATISTICS_STATUS_STORE,
    query: {
      company_id: company_id,
      timezone: timezone,
    },
  });
  if (errForStatusDelete) {
    logger.error(
      `Error while deleting old status data for ${company_id}, ${timezone}: `,
      errForStatusDelete
    );
  }

  for (const timeFrame in LEADERBOARD_DATE_FILTERS) {
    if (
      [
        LEADERBOARD_DATE_FILTERS.TODAY,
        LEADERBOARD_DATE_FILTERS.YESTERDAY,
        LEADERBOARD_DATE_FILTERS.LAST_3_MONTHS,
        LEADERBOARD_DATE_FILTERS.LAST_6_MONTHS,
      ].includes(LEADERBOARD_DATE_FILTERS[timeFrame])
    )
      continue;

    let dateRange =
      LeaderboardHelper.dateFilters[LEADERBOARD_DATE_FILTERS[timeFrame]](
        timezone
      );

    let [start_date, end_date] = dateRange;

    if (
      [
        LEADERBOARD_DATE_FILTERS.THIS_MONTH,
        LEADERBOARD_DATE_FILTERS.THIS_WEEK,
      ].includes(LEADERBOARD_DATE_FILTERS[timeFrame])
    ) {
      dateRange =
        LeaderboardHelper.dateFilters[LEADERBOARD_DATE_FILTERS.YESTERDAY](
          timezone
        );

      end_date = dateRange[1];
    }

    const taskPromise = getTaskArrayForTable({
      company_id: company_id,
      start_time: start_date,
      end_time: end_date,
    });

    const statusPromise = getStatusArrayForTable({
      company_id: company_id,
      start_time: start_date,
      end_time: end_date,
    });

    const [[tasks, errForTasks], [statusCount, errForStatusCount]] =
      await Promise.all([taskPromise, statusPromise]);

    if (errForTasks || errForStatusCount) {
      logger.error(
        `Error while fetching data from database: `,
        errForTasks || errForStatusCount
      );
      continue;
    }

    let taskArray = [],
      statusArray = [];
    for (let task of tasks) {
      taskArray.push({
        timeframe: LEADERBOARD_DATE_FILTERS[timeFrame],
        timezone: timezone,
        completed_count: task.completed_task_count,
        skipped_count: task.skipped_task_count,
        pending_count: task.pending_task_count,
        cadence_id: task.cadence_id,
        company_id: company_id,
        user_id: task.user_id,
        active_lead_count: task.active_lead_count,
        node_type: task.node_type,

        automated_completed_count: AUTOMATED_NODE_TYPES_ARRAY.includes(
          task.node_type
        )
          ? task.automated_task_count
          : 0,

        cadence_data: {
          cadence_id: task.cadence_id,
          name: task.cadence_name,
          node_length: task.total_nodes,
        },
        user_data: {
          total_leads_in_cadence: task.total_leads,
          user_id: task.user_id,
          user_first_name: task.first_name,
          user_last_name: task.last_name,
          user_profile_picture: `https://storage.googleapis.com/apt-cubist-307713.appspot.com/crm/profile-images/${task.user_id}`,
          is_profile_picture_present: task.is_profile_picture_present,
          sub_department: task.sd_name,
        },
      });
    }

    for (let status of statusCount) {
      statusArray.push({
        timeframe: LEADERBOARD_DATE_FILTERS[timeFrame],
        timezone: timezone,
        converted_count: parseInt(status.converted_count, 10),
        disqualified_count: parseInt(status.disqualified_count, 10),

        cadence_id: status.cadence_id,
        company_id: company_id,
        user_id: status.user_id,

        cadence_data: {
          cadence_id: status.cadence_id,
          name: status.cadence_name,
          node_length: status.total_nodes,
        },
        user_data: {
          total_leads_in_cadence: status.total_leads,
          user_id: status.user_id,
          user_first_name: status.first_name,
          user_last_name: status.last_name,
          user_profile_picture: `https://storage.googleapis.com/apt-cubist-307713.appspot.com/crm/profile-images/${status.user_id}`,
          is_profile_picture_present: status.is_profile_picture_present,
          sub_department: status.sd_name,
        },
      });
    }

    // Dont Cache company for non empty stats
    if (taskArray.length != 0) toCache = false;

    const [statsStore, errForStore] = await Repository.bulkCreate({
      tableName: DB_TABLES.STATISTICS_STORE,
      createObject: taskArray,
    });
    if (errForStore)
      logger.error(`Error while table store creation: `, errForStore);

    const [statsStatusStore, errForStatusStore] = await Repository.bulkCreate({
      tableName: DB_TABLES.STATISTICS_STATUS_STORE,
      createObject: statusArray,
    });
    if (errForStatusStore)
      logger.error(`Error while status creation: `, errForStore);
  }
  return ['Finished processing', null];
};

module.exports = recalculateStatisticsForUser;
