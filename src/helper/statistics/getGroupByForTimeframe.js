// Utils
const logger = require('../../utils/winston');
const {
  LEADERBOARD_DATE_FILTERS,
  STATISTICS_DATE_COLUMN_TYPE,
} = require('../../utils/enums');

// Packages
const { sequelize } = require('../../db/models');

const getGroupByForTimeframe = ({
  filter,
  timeStampColumn,
  offSetInMinutes,
  columnType = STATISTICS_DATE_COLUMN_TYPE.TIMESTAMP,
}) => {
  try {
    if (columnType === STATISTICS_DATE_COLUMN_TYPE.TIMESTAMP) {
      switch (filter) {
        case LEADERBOARD_DATE_FILTERS.YESTERDAY:
        case LEADERBOARD_DATE_FILTERS.TODAY: {
          return [
            {
              intervalAttribute: [
                sequelize.fn(
                  'HOUR',
                  sequelize.fn(
                    'DATE_ADD',
                    sequelize.literal(
                      `FROM_UNIXTIME(${timeStampColumn} / 1000)`
                    ),
                    sequelize.literal(`INTERVAL ${offSetInMinutes} MINUTE`)
                  )
                ),
                'hour',
              ],
              groupBy: ['hour'],
            },

            null,
          ];
        }
        case LEADERBOARD_DATE_FILTERS.LAST_WEEK:
        case LEADERBOARD_DATE_FILTERS.THIS_WEEK: {
          return [
            {
              intervalAttribute: [
                sequelize.fn(
                  'DAYOFWEEK',
                  sequelize.fn(
                    'DATE_ADD',
                    sequelize.literal(
                      `FROM_UNIXTIME(${timeStampColumn} / 1000)`
                    ),
                    sequelize.literal(`INTERVAL ${offSetInMinutes} MINUTE`)
                  )
                ),
                'day_of_week',
              ],
              groupBy: ['day_of_week'],
            },

            null,
          ];
        }
        case LEADERBOARD_DATE_FILTERS.LAST_MONTH:
        case LEADERBOARD_DATE_FILTERS.THIS_MONTH: {
          return [
            {
              intervalAttribute: [
                sequelize.fn(
                  'DAYOFMONTH',
                  sequelize.fn(
                    'DATE_ADD',
                    sequelize.literal(
                      `FROM_UNIXTIME(${timeStampColumn} / 1000)`
                    ),
                    sequelize.literal(`INTERVAL ${offSetInMinutes} MINUTE`)
                  )
                ),
                'day_of_month',
              ],
              groupBy: ['day_of_month'],
            },

            null,
          ];
        }
      }
    } else {
      // Datetime column

      switch (filter) {
        case LEADERBOARD_DATE_FILTERS.YESTERDAY:
        case LEADERBOARD_DATE_FILTERS.TODAY: {
          return [
            {
              intervalAttribute: [
                sequelize.fn(
                  'HOUR',
                  sequelize.fn(
                    'DATE_ADD',
                    sequelize.col(timeStampColumn),
                    sequelize.literal(`INTERVAL ${offSetInMinutes} MINUTE`)
                  )
                ),
                'hour',
              ],
              groupBy: ['hour'],
            },

            null,
          ];
        }
        case LEADERBOARD_DATE_FILTERS.LAST_WEEK:
        case LEADERBOARD_DATE_FILTERS.THIS_WEEK: {
          return [
            {
              intervalAttribute: [
                sequelize.fn(
                  'DAYOFWEEK',
                  sequelize.fn(
                    'DATE_ADD',
                    sequelize.col(timeStampColumn),
                    sequelize.literal(`INTERVAL ${offSetInMinutes} MINUTE`)
                  )
                ),
                'day_of_week',
              ],
              groupBy: ['day_of_week'],
            },

            null,
          ];
        }
        case LEADERBOARD_DATE_FILTERS.LAST_MONTH:
        case LEADERBOARD_DATE_FILTERS.THIS_MONTH: {
          return [
            {
              intervalAttribute: [
                sequelize.fn(
                  'DAYOFMONTH',
                  sequelize.fn(
                    'DATE_ADD',
                    sequelize.col(timeStampColumn),
                    sequelize.literal(`INTERVAL ${offSetInMinutes} MINUTE`)
                  )
                ),
                'day_of_month',
              ],
              groupBy: ['day_of_month'],
            },

            null,
          ];
        }
      }
    }
  } catch (err) {
    logger.error('Error while getting group by clause for timeframe: ', err);
    return [null, err.message];
  }
};

module.exports = getGroupByForTimeframe;
