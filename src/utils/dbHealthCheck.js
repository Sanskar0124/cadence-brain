const { sequelize } = require('../db/models');

const dbHealthCheck = async () => {
  try {
    await sequelize.authenticate();
    return ['success', null];
  } catch (error) {
    return [null, error?.message];
  }
};

module.exports = dbHealthCheck;
