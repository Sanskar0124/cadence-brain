// * Utils
const logger = require('../../utils/winston');
const { CADENCE_TYPES } = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// * Helper Imports
const AccessTokenHelper = require('../access-token');
const CompanyFieldMapHelper = require('../company-field-map');

// * Repository Imports
const Repository = require('../../repository');

const checkCadenceAccess = ({ cadence, user }) => {
  try {
    if (
      cadence.type === CADENCE_TYPES.PERSONAL &&
      cadence.user_id !== user.user_id
    )
      return [
        null,
        `The Cadence you have selected is only accessible to the following user : ${cadence?.User?.first_name} ${cadence?.User?.last_name}.`,
      ];
    else if (
      cadence.type === CADENCE_TYPES.TEAM &&
      cadence.sd_id !== user.sd_id
    )
      return [
        null,
        `The selected user belongs to <strong>${user?.Sub_Department?.name}</strong>. The Cadence you have selected is only accessible to users of the following group: <strong>${cadence?.Sub_Department?.name}</strong>.`,
      ];
    else if (
      cadence.type === CADENCE_TYPES.COMPANY &&
      cadence.company_id !== user.company_id
    )
      return [null, 'This user does not have access to this cadence.'];
    return [true, null];
  } catch (err) {
    logger.error(
      'An error occurred while checking if user has access to cadence: ',
      err
    );
    return [null, err.message];
  }
};

module.exports = checkCadenceAccess;
