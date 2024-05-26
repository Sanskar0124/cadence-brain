//Utils
const logger = require('../../utils/winston');
const {
  LEAD_WARMTH,
  ACTIVITY_TYPE,
  SETTINGS_ID_TYPES,
  LEAD_SCORE_RUBRIKS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const { FRONTEND_URL } = require('../../utils/config');
const { DB_NAME } = require('../../utils/config');

// Packages
const { sequelize } = require('../../db/models');
const { Op } = require('sequelize');

// Repository
const Repository = require('../../repository');
const ActivityHelper = require('../activity/');
const ActivityRepository = require('../../repository/activity.repository');

const generateQuery = ({
  id,
  priority,
  score_threshold,
  reset_period,
  score_threshold_unchanged = false,
  reset_period_unchanged = false,
}) => {
  let unix_reset_score =
    reset_period === 0 ? null : Date.now() + reset_period * 24 * 60 * 60 * 1000;

  const BASE_QUERY = `
    update IGNORE ${DB_NAME}.lead lead_table
    inner join user user_table on (user_table.user_id = lead_table.user_id and user_table.${SETTINGS_ID_TYPES[priority]}="${id}")
    inner join settings settings_table on (user_table.user_id = settings_table.user_id and settings_table.ls_setting_priority=${priority})
  `;
  if (score_threshold_unchanged && !reset_period_unchanged) {
    // Only reset_period of leads will be changed
    return (
      BASE_QUERY +
      `
      SET unix_reset_score=
        CASE 
          WHEN lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN ${unix_reset_score}
          ELSE null
        END;
    `
    );
  } else if (reset_period_unchanged && !score_threshold_unchanged) {
    // Only reset lead_warmth
    if (score_threshold === 0)
      return (
        BASE_QUERY +
        `
      SET 
      lead_table.lead_warmth="${LEAD_WARMTH.COLD}";
      `
      );
    return (
      BASE_QUERY +
      `
      SET 
      lead_table.lead_warmth = 
        CASE
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.COLD}" THEN "${LEAD_WARMTH.HOT}"
          WHEN lead_table.lead_score<${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN "${LEAD_WARMTH.COLD}"
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN "${LEAD_WARMTH.HOT}"
          ELSE "${LEAD_WARMTH.COLD}"
        END,
      unix_reset_score=
        CASE
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.COLD}" THEN ${unix_reset_score}
          WHEN lead_table.lead_score<${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN null
          ELSE unix_reset_score
        END;

    `
    );
  } else if (!reset_period_unchanged && !score_threshold_unchanged) {
    if (score_threshold === 0)
      return (
        BASE_QUERY +
        `
      SET 
        lead_table.lead_warmth="${LEAD_WARMTH.COLD}",
        unix_reset_score=${unix_reset_score};
      `
      );
    return (
      BASE_QUERY +
      `
    SET 
    lead_table.lead_warmth = 
        CASE
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.COLD}" THEN "${LEAD_WARMTH.HOT}"
          WHEN lead_table.lead_score<${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN "${LEAD_WARMTH.COLD}"
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN "${LEAD_WARMTH.HOT}"
          ELSE "${LEAD_WARMTH.COLD}"
        END,
      unix_reset_score=
        CASE
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.COLD}" THEN ${unix_reset_score}
          WHEN lead_table.lead_score<${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN null
          ELSE unix_reset_score
        END;
    `
    );
  } else
    return (
      BASE_QUERY +
      `
    SET 
    lead_table.lead_warmth = 
        CASE
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.COLD}" THEN "${LEAD_WARMTH.HOT}"
          WHEN lead_table.lead_score<${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN "${LEAD_WARMTH.COLD}"
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN "${LEAD_WARMTH.HOT}"
          ELSE "${LEAD_WARMTH.COLD}"
        END,
      unix_reset_score=
        CASE
          WHEN lead_table.lead_score>=${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.COLD}" THEN ${unix_reset_score}
          WHEN lead_table.lead_score<${score_threshold} and lead_table.lead_warmth="${LEAD_WARMTH.HOT}" THEN null
          ELSE unix_reset_score
        END;
  `
    );
};

/**
 * Mandatory Fields
 * @param {UUIDv4} id : One of user_id, sd_id or company_id
 * @param {Number} priority: Priority of 1: USER, 2:SD, 3: ADMIN
 * @param {Number} score_threshold: Score threshold of the user
 * Optional Fields
 * @param {Boolean} score_threshold_unchanged: Whether score_threshold has been changed
 * @param {Boolean} reset_period_unchanged: Whether reset_period has been changed
 */
const updateLeadScoreOnSettingsChange = async ({
  id,
  priority,
  score_threshold,
  reset_period,
  score_threshold_unchanged = false,
  reset_period_unchanged = false,
}) => {
  if (
    !id ||
    !priority ||
    score_threshold === null ||
    score_threshold === undefined ||
    reset_period === null ||
    reset_period === undefined
  ) {
    return [null, 'Missing mandatory fields'];
  }
  if (score_threshold_unchanged && reset_period_unchanged) {
    return ['No update required for lead_scoring', null];
  }
  let t = await sequelize.transaction();
  try {
    // Find all the leads who are above the threshold and not hot leads yet
    // Design a query to fetch  leads for following cases

    // A. All leads of a company
    // B. All leads of subdepartment
    // C. All leads of user
    let hotConvertibleLeads, errForHotConvertibleLeads;
    if (score_threshold !== 0 && score_threshold)
      [hotConvertibleLeads, errForHotConvertibleLeads] =
        await Repository.fetchAll({
          tableName: DB_TABLES.LEAD,
          query: {
            lead_score: {
              [Op.gte]: score_threshold,
            },
            lead_warmth: LEAD_WARMTH.COLD,
          },
          include: {
            [DB_TABLES.USER]: {
              where: {
                [SETTINGS_ID_TYPES?.[priority]]: id,
              },
              attributes: [],
              required: true,
            },
          },
          extras: {
            attributes: [
              'first_name',
              'last_name',
              'lead_id',
              'user_id',
              'lead_score',
            ],
          },
        });

    let coldConvertibleLeads, errForColdConvertibleLeads;
    if (score_threshold !== 0 && score_threshold)
      [coldConvertibleLeads, errForColdConvertibleLeads] =
        await Repository.fetchAll({
          tableName: DB_TABLES.LEAD,
          query: {
            lead_score: {
              [Op.lte]: score_threshold,
            },
            lead_warmth: LEAD_WARMTH.HOT,
          },
          include: {
            [DB_TABLES.USER]: {
              where: {
                [SETTINGS_ID_TYPES?.[priority]]: id,
              },
              attributes: [],
              required: true,
            },
          },
          extras: {
            attributes: [
              'first_name',
              'last_name',
              'lead_id',
              'user_id',
              'lead_score',
            ],
          },
        });

    const hotLeadReasons = hotConvertibleLeads?.map((lead) => ({
      lead_id: lead?.lead_id,
      reason: LEAD_SCORE_RUBRIKS.SETTINGS_RESET,
      lead_warmth: LEAD_WARMTH.HOT,
      has_warmth_changed: true,
      score_delta: lead?.lead_score,
    }));
    const coldLeadReasons = coldConvertibleLeads?.map((lead) => ({
      lead_id: lead?.lead_id,
      reason: LEAD_SCORE_RUBRIKS.SETTINGS_RESET,
      lead_warmth: LEAD_WARMTH.COLD,
      has_warmth_changed: true,
      score_delta: lead?.lead_score,
    }));

    const leadScoreReasons = [...hotLeadReasons, ...coldLeadReasons];

    // Update the statuses of all the leads that match the above criteria in an sql query
    const updateQuery = generateQuery({
      id,
      priority,
      score_threshold,
      reset_period,
      score_threshold_unchanged,
      reset_period_unchanged,
    });
    const [data, errForUpdate] = await Repository.runRawUpdateQuery({
      rawQuery: updateQuery,
    });

    if (errForUpdate) {
      t.rollback();
      return [null, errForUpdate];
    }

    // Create Activities
    const activities = hotConvertibleLeads
      ?.map((lead) => {
        let [activity, errForActivity] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.HOT_LEAD,
            variables: {
              lead_first_name: lead?.first_name,
              lead_last_name: lead?.last_name,
            },
            activity: {
              lead_id: lead?.lead_id,
              user_id: lead?.user_id,
              incoming: true,
            },
          });
        if (errForActivity) return false;
        return activity;
      })
      ?.filter((activity) => !!activity);

    // Create Entries for Lead Score Reset through Settings Change
    const [reasons, errForReasons] = await Repository.bulkCreate({
      tableName: DB_TABLES.LEAD_SCORE_REASONS,
      createObject: leadScoreReasons,
      t,
    });

    if (errForReasons) {
      logger.error(
        'Lead score reset reasons could not be upgraded for settings change',
        errForReasons
      );
    }
    // Create the activities but do not send via socket,
    // due to socket possibility of socket contamination when hotConvertible leads are large.
    if (activities?.length > 0) {
      let [createdActivities, errForCreatedActivities] =
        await ActivityRepository.createBulkActivity(activities);
      if (errForCreatedActivities)
        logger.error('Unable to create bulk activities for lead warmth update');
    }
    t.commit();
    logger.info('Successfully updated lead warmth');
    return ['Successfully updated lead score values on settings change', null];
  } catch (err) {
    t.rollback();
    return [
      null,
      'An error occured while updating lead warmth after settings change',
      err?.message,
    ];
  }
};

module.exports = updateLeadScoreOnSettingsChange;
