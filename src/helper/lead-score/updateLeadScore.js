//Utils
const logger = require('../../utils/winston');
const {
  SETTING_TYPES,
  LEAD_SCORE_RUBRIKS,
  LEAD_INTEGRATION_TYPES,
  NOTIFICATION_TYPES,
  LEAD_WARMTH,
  ACTIVITY_TYPE,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');
const { FRONTEND_URL } = require('../../utils/config');

// Packages
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');
const ActivityHelper = require('../activity/');
const SocketHelper = require('../socket');
const UserHelper = require('../user');
const HtmlHelper = require('../html');
const AmazonService = require('../../services/Amazon');
const NotificationHelper = require('../notification');

/**
 * @param {Object} lead - Prospect to update score
 * @param {String} rubrik - ENUM {LEAD_SCORE_RUBRIKS}
 * Optional Parameter specifications
 * @param {Object} rest -
 * 1. CASE 1: Outgoing Call
 * For outgoing call, we need the outgoing_call_duration
 * @param {Number} rest.outgoing_call_duration - Outgoing Call Duration in Seconds
 * 2. CASE 2: Status Update
 * Status Updates are integration_status updtes.
 * This is a custom field mapping with the Integration.
 * @param {String} rest.current_status - current status of lead/contact
 * @param {String} rest.previous_status - previous status of lead/contact
 * @param {Boolean} rest.resetScore - for disqualified/converted leads
 * @param {Object} rest.field_map - The field map for the lead/account/contact for the current Integration
 */
const updateLeadScore = async ({ lead, rubrik, activity_id, ...rest }) => {
  // SANITY CHECKS
  if (!lead)
    return [
      null,
      'Please pass the lead object as a parameter to the lead score helper',
    ];
  if (!Object.values(LEAD_SCORE_RUBRIKS)?.includes(rubrik))
    return [null, 'unsupported rubrik type for lead scoring'];

  let t = await sequelize.transaction();
  try {
    let user = lead.User,
      errForUser;
    // If lead passed to the fn does not have associated user, fetch user
    if (!user) {
      [user, errForUser] = await Repository.fetchOne({
        tableName: DB_TABLES.USER,
        query: {
          user_id: lead?.user_id,
        },
        extras: {
          attributes: ['user_id', 'integration_type', 'email'],
        },
        t,
      });

      if (errForUser) {
        t.rollback();
        logger.error(
          'An error occured while fetching user while lead scoring',
          errForUser
        );
        return [null, errForUser];
      }
    }
    // Fetch Settings
    const [settings, errForSettings] = await UserHelper.getSettingsForUser({
      user_id: user.user_id,
      setting_type: SETTING_TYPES.LEAD_SCORE_SETTINGS,
    });

    if (errForSettings) {
      t.rollback();
      logger.error(
        'An error occured while setting user settings for lead scoring',
        errForSettings
      );
      return [null, errForSettings];
    }
    let leadScoreIncrement = 0;
    switch (rubrik) {
      // FALL THROUGH: BEGIN
      // Positive grading
      case LEAD_SCORE_RUBRIKS.EMAIL_CLICKED:
      case LEAD_SCORE_RUBRIKS.EMAIL_OPENED:
      case LEAD_SCORE_RUBRIKS.EMAIL_REPLIED:
      case LEAD_SCORE_RUBRIKS.INCOMING_CALL:
      case LEAD_SCORE_RUBRIKS.SMS_CLICKED:
      case LEAD_SCORE_RUBRIKS.DEMO_BOOKED:
      // Negative grading
      case LEAD_SCORE_RUBRIKS.UNSUBSCRIBE:
      case LEAD_SCORE_RUBRIKS.BOUNCED_MAIL:
        leadScoreIncrement = settings.Lead_Score_Setting?.[rubrik];
        break;
      // FALL THROUGH END
      case LEAD_SCORE_RUBRIKS.OUTGOING_CALL: {
        if (!rest.outgoing_call_duration) {
          t.rollback();
          logger.error('missing attribute: outgoing_call_duration');
          return [null, 'missing attribute: outgoing_call_duration'];
        }

        if (
          rest?.outgoing_call_duration >=
          settings.Lead_Score_Setting?.outgoing_call_duration
        )
          leadScoreIncrement = settings.Lead_Score_Setting?.[rubrik];
        break;
      }
      case LEAD_SCORE_RUBRIKS.STATUS_UPDATE: {
        if (rest?.resetScore) {
          // Disqualify/Convert Lead
          let [disqLead, errForDisqLead] = await Repository.update({
            tableName: DB_TABLES.LEAD,
            query: {
              lead_id: lead.lead_id,
            },
            updateObject: {
              lead_warmth: LEAD_WARMTH.COLD,
              lead_score: 0,
            },
            t,
          });

          if (errForDisqLead) {
            t.rollback();
            logger.error(
              'Error while disqualifying/converting lead',
              errForDisqLead
            );
            return [null, 'Error while disqualifying/converting lead'];
          }
          t.commit();
          return ['Lead disqualified and score reset', null];
        }

        /**
         * previous status can be null/undefined in some instances
         * In such situations, we assign marks for current status
         * Necessary Condition: integration_status must be valid
         * for hubspot_contact/salesforce_lead
         */
        if (!rest.current_status) {
          t.rollback();
          logger.error('missing attribute: current_status');
          return [null, 'missing attribute: current_status'];
        }
        /**
         * As of March 16, 2023 only
         * Hubspot and Salesforce
         * support this feature
         * For Status Updates
         */
        let SUPPORTED_INTEGRATION_TYPES = {
          HUBSPOT: 'hubspot',
          SALESFORCE: 'salesforce',
          BULLHORN: 'bullhorn',
        };
        let LEAD_SCORE_SUPPORTED_INTEGRATION_TYPES = {
          [LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD]: 'picklist_values_lead',
          [LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT]:
            'picklist_values_account',
          [LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT]: 'picklist_values_lead',
          [LEAD_INTEGRATION_TYPES.BULLHORN_LEAD]: 'picklist_values_lead',
          [LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT]: 'picklist_values_contact',
          [LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE]:
            'picklist_values_candidate',
        };

        // fetch field map table name from lead
        let FIELD_MAP = Object.keys(SUPPORTED_INTEGRATION_TYPES)?.reduce(
          (prev, curr, currInd, arr) => {
            // user integration types can be
            // hubspot_owner, salesforce_owner, google_sheets_owner etc
            // essentially they contain the keyword from {SUPPORTED_INTEGRATION_TYPES}
            if (
              user?.integration_type
                ?.toLowerCase()
                ?.includes(curr?.toLowerCase())
            )
              return `${curr?.toUpperCase()}_FIELD_MAP`;
            return prev;
          },
          'FIELD_MAP'
        );

        if (FIELD_MAP === 'FIELD_MAP') {
          t.rollback();
          logger.error('unsupported integration type');
          return [null, 'unsupported integration_type'];
        }

        /**
         * CASE 1: Integration Settings (Labels and Values) Have been altered
         * Outcome: No Match found in LeadScoreSettings for current status
         * No Change: User should update settings
         */

        let { current_status, previous_status, field_map } = rest;

        /**
         * In the Lead Score Settings Table
         * We store the `label` from picklist_values of integration
         * meanwhile in HS contacts, SF lead and account,
         * we store the `value`.
         *
         * Hence a reverse lookup needs to happen
         * Operation is still inexpensive because field maps
         * have few values
         *
         * However there are some discrepancies
         * Hence for future proofing we shall
         * compare current_status and previous_status with
         * both keys and values
         *  */
        if (!field_map) {
          t.rollback();
          return [null, 'No field map specified'];
        }
        /**
         * If previous status is unavailable,
         * we rely on the score of current status
         *
         * Otherwise find out the score of the previous status and current status
         * using both field map and LeadScoreSettings -> status_update -> one of LEAD_SCORE_SUPPORTED_INTEGRATION_TYPES
         */

        // Fetch Score for previous status
        let prev_score =
          // CASE 1: previous_status is a `label`
          settings?.Lead_Score_Setting?.[rubrik]?.[
            LEAD_SCORE_SUPPORTED_INTEGRATION_TYPES?.[lead?.integration_type]
          ]?.[previous_status] ||
          // CASE 2: previous_status is a `value`
          settings?.Lead_Score_Setting?.[rubrik]?.[
            LEAD_SCORE_SUPPORTED_INTEGRATION_TYPES?.[lead?.integration_type]
          ]?.[
            field_map?.integration_status?.picklist_values?.filter(
              (status) => status?.value === previous_status
            )?.[0]?.label
          ];
        let curr_score =
          // CASE 1: previous_status is a `label`
          settings?.Lead_Score_Setting?.[rubrik]?.[
            LEAD_SCORE_SUPPORTED_INTEGRATION_TYPES?.[lead?.integration_type]
          ]?.[current_status] ||
          // CASE 2: previous_status is a `value`
          settings?.Lead_Score_Setting?.[rubrik]?.[
            LEAD_SCORE_SUPPORTED_INTEGRATION_TYPES?.[lead?.integration_type]
          ]?.[
            field_map?.integration_status?.picklist_values?.filter(
              (status) => status?.value === current_status
            )?.[0]?.label
          ];

        // sanity checks
        curr_score = curr_score ?? 0;
        prev_score = prev_score ?? 0;

        if (curr_score < 0 && prev_score < 0)
          leadScoreIncrement = curr_score - prev_score;
        else if (curr_score < 0) leadScoreIncrement = curr_score - prev_score;
        else if (prev_score < 0) leadScoreIncrement = prev_score - curr_score;
        else leadScoreIncrement = curr_score - prev_score;

        if (lead?.lead_score <= 0) leadScoreIncrement = curr_score;
      }
    }

    if (leadScoreIncrement === 0) {
      t.rollback();
      return ['Lead Score remains unchanged', null];
    }
    current_lead_score = lead?.lead_score ?? 0;

    let lead_warmth_threshold =
      leadScoreIncrement + lead?.lead_score >=
      settings?.Lead_Score_Setting?.score_threshold;

    let updateObject = {
      // lead score cannot be negative
      lead_score: leadScoreIncrement + current_lead_score,
      lead_warmth: lead_warmth_threshold ? LEAD_WARMTH.HOT : LEAD_WARMTH.COLD,
      unix_reset_score:
        settings?.Lead_Score_Setting.reset_period !== 0
          ? Date.now() +
            settings?.Lead_Score_Setting?.reset_period * 24 * 60 * 60 * 100
          : null,
    };

    let has_warmth_changed =
      lead?.lead_warmth === updateObject?.lead_warmth ||
      settings.Lead_Score_Setting?.score_threshold === 0
        ? false
        : true;
    // Add entry to lead score reasons table
    let leadScoreReason, errForLeadScoreReason;
    if (activity_id) {
      [leadScoreReason, errForLeadScoreReason] = await Repository.create({
        tableName: DB_TABLES.LEAD_SCORE_REASONS,
        createObject: {
          lead_id: lead?.lead_id,
          activity_id,
          lead_warmth: updateObject?.lead_warmth,
          has_warmth_changed,
          reason: rubrik,
          score_delta: leadScoreIncrement,
        },
        t,
      });
    } else {
      // Handle this case for status updates as they do not have activities
      // only dq and converted have activities, but for consistency we will updated
      // them here as well, since for Lead Scoring, behaviour of DQ and Converted is
      // the same as of May 2023.
      if (rubrik === LEAD_SCORE_RUBRIKS.STATUS_UPDATE) {
        [leadScoreReason, errForLeadScoreReason] = await Repository.create({
          tableName: DB_TABLES.LEAD_SCORE_REASONS,
          createObject: {
            lead_id: lead?.lead_id,
            metadata: `Status changed to ${rest?.current_status}`,
            lead_warmth: updateObject?.lead_warmth,
            has_warmth_changed,
            reason: rubrik,
            score_delta: leadScoreIncrement,
          },
          t,
        });
      }
      // Create an entry and flag missing activity
      else if (
        rubrik !== LEAD_SCORE_RUBRIKS.MANUAL_RESET ||
        rubrik !== LEAD_SCORE_RUBRIKS.CRON_RESET ||
        rubrik !== LEAD_SCORE_RUBRIKS.SETTINGS_RESET
      ) {
        [leadScoreReason, errForLeadScoreReason] = await Repository.create({
          tableName: DB_TABLES.LEAD_SCORE_REASONS,
          createObject: {
            lead_id: lead?.lead_id,
            metadata: `The activity for this score was not created`,
            lead_warmth: updateObject?.lead_warmth,
            has_warmth_changed,
            reason: rubrik,
            score_delta: leadScoreIncrement,
          },
          t,
        });
      }
    }

    if (errForLeadScoreReason) {
      t.rollback();
      return [
        'An error occured while creating an entry for lead score reason',
        null,
      ];
    }

    // Do not update warmth if it does not change
    if (
      lead?.lead_warmth === updateObject.lead_warmth ||
      settings.Lead_Score_Setting?.score_threshold === 0
    ) {
      delete updateObject.lead_warmth;
      if (updateObject.lead_warmth === LEAD_WARMTH.COLD)
        delete updateObject.unix_reset_score;
    }

    // set unix_reset_score to null if lead_warmth is cold
    if (updateObject.lead_warmth === LEAD_WARMTH.COLD)
      updateObject.unix_reset_score = null;

    // Update Lead Score
    const [updatedLead, errForUpdatedLead] = await Repository.update({
      tableName: DB_TABLES.LEAD,
      updateObject,
      query: {
        lead_id: lead?.lead_id,
      },
      t,
    });

    if (errForUpdatedLead) {
      t.rollback();
      logger.error(
        'An error occured while updating lead_score',
        errForUpdatedLead
      );
      return [null, errForUpdatedLead];
    }

    if (updateObject.lead_warmth === LEAD_WARMTH.HOT) {
      const [notificationTemplate, errForNotificationTemplate] =
        NotificationHelper.getNotificationFromTemplate({
          type: NOTIFICATION_TYPES.HOT_LEAD,
          notification: {
            user_id: user?.user_id,
            lead_id: lead?.lead_id,
            lead_first_name: lead?.first_name,
            lead_last_name: lead?.last_name,
          },
        });

      let [notifcation, errForNotification] =
        await SocketHelper.sendNotification(notificationTemplate);

      if (errForNotification)
        logger.error(
          'Unable to send notification for lead scoring: ',
          errForNotification
        );

      const [activity, errForActivity] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.HOT_LEAD,
          variables: {
            lead_first_name: lead?.first_name,
            lead_last_name: lead?.last_name,
          },
          activity: {
            lead_id: lead?.lead_id,
            incoming: true,
          },
        });

      // Create Activity if the lead becomes hot
      let [sentActivity, errForSentActivity] =
        await ActivityHelper.activityCreation(activity, user?.user_id);

      if (errForSentActivity)
        logger.error(
          'Unable to create send activity for lead scoring: ',
          errForSentActivity
        );

      // Send an email to user if lead becomes hot
      const [mail, err] = await AmazonService.sendHtmlMails({
        subject: 'You have a Hot Lead',
        body: HtmlHelper.hotLeadMail(
          `${FRONTEND_URL}/crm/leads/${lead?.lead_id}`,
          `${lead.first_name}${' ' + lead.last_name}`
        ),
        emailsToSend: [user.email],
      });

      if (err) logger.error('Unable to send email to user: ', err);
    }

    t.commit();
    let successRes = `Updated Lead with lead_id ${lead.lead_id} with score ${
      updateObject?.lead_score
    } status ${updateObject?.lead_warmth ?? 'is unchanged'} for ${rubrik}`;
    logger.info(successRes);
    return [successRes, null];
  } catch (err) {
    t.rollback();
    logger.error(`An error occured while updating lead score:`, err);
    return [null, `An err occured while updating lead score`];
  }
};

module.exports = updateLeadScore;
