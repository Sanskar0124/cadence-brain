// Utils
const logger = require('../../utils/winston');
const {
  ACTIVITY_TEMPLATES,
  ACTIVITY_SUBTYPES,
  ACTIVITY_TYPE,
} = require('../../utils/enums');
const replaceVariablesForActivity = require('../variables/replaceVariablesForActivity');

/**
 * @param {String} type - type for the activity
 * @param {String} sub_type - sub type for activity, based on this the name and status will be picked from ACTIVITY_TEMPLATES enum
 * @param {Object} variables - All variables needed for name and status will be passed in this
 */
const getActivityFromTemplates = ({
  type,
  sub_type = ACTIVITY_SUBTYPES.DEFAULT,
  variables = {},
  activity = {},
}) => {
  try {
    //console.log({ type, sub_type, variables, activity });
    if (!type) return [null, `Type is required for activity.`];

    activity.type = type; // assign type to activity

    let activity_template =
      ACTIVITY_TEMPLATES[type][sub_type || ACTIVITY_SUBTYPES.DEFAULT]; // the template which will be used

    // replace variables
    let name, status;
    if (
      Object.keys(variables).length === 1 &&
      type === ACTIVITY_TYPE.LAUNCH_CADENCE
    ) {
      name = replaceVariablesForActivity(activity_template?.name, variables);
      status =
        replaceVariablesForActivity(activity_template?.name, variables) +
        ' Successfully';
    } else {
      name = replaceVariablesForActivity(activity_template?.name, variables);
      status = replaceVariablesForActivity(
        activity_template?.status,
        variables
      );
    }

    // add name and status to activity
    activity.name = name;
    activity.status = status;

    //console.log({ activity });
    return [activity, null];
  } catch (err) {
    logger.error(`Error while fetching activity from templates: `, err);
    return [null, err.message];
  }
};

module.exports = getActivityFromTemplates;
