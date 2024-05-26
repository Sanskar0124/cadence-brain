// Utils
const logger = require('../../utils/winston');
const {
  NOTIFICATION_SUBTYPES,
  NOTIFICATION_TEMPLATES,
} = require('../../utils/enums');
const replaceVariablesForActivity = require('../variables/replaceVariablesForActivity');

/**
 * @param {String} type - type for the activity
 * @param {String} sub_type - sub type for activity, based on this the name and status will be picked from ACTIVITY_TEMPLATES enum
 * @param {Object} variables - All variables needed for name and status will be passed in this
 */
const getNotificationFromTemplates = ({
  type,
  sub_type = NOTIFICATION_SUBTYPES.DEFAULT,
  variables = {},
  notification = {},
}) => {
  try {
    if (!type) return [null, `Type is required for notification.`];

    notification.type = type; // assign type to notification
    let notification_template =
      NOTIFICATION_TEMPLATES[type][sub_type || ACTIVITY_SUBTYPES.DEFAULT]; // the template which will be used

    // replace variables
    let title = replaceVariablesForActivity(
      notification_template?.title,
      variables
    );

    // add name and status to activity
    notification.title = title;

    console.log({ notification });
    return [notification, null];
  } catch (err) {
    logger.error(`Error while fetching notification from templates: `, err);
    return [null, err.message];
  }
};

module.exports = getNotificationFromTemplates;
