// Utils
const logger = require('../../utils/winston');
const { CADENCE_STATUS } = require('../../utils/enums');

// Repositories
const CadenceRepository = require('../../repository/cadence.repository');

const createCadenceForUser = async (user, sub_department) => {
  try {
    const [createdCadence, errForCreatedCadence] =
      await CadenceRepository.createCadence({
        name: `${sub_department.name}_${user.first_name}-${user.last_name}_inbound`,
        status: CADENCE_STATUS.NOT_STARTED,
        inside_sales: true,
        sd_id: sub_department.sd_id,
        user_id: user.user_id,
      });

    if (errForCreatedCadence) return [null, errForCreatedCadence];

    return [createdCadence, null];
  } catch (err) {
    logger.error(`Error while creating cadence for user: `, err);
    return [null, err.message];
  }
};

module.exports = createCadenceForUser;
