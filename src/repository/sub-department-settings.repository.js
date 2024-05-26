// Utils
const logger = require('../utils/winston');

// Models
const { Sub_Department_Settings } = require('../db/models');

const createSubDepartmentSettings = async (sdSettings) => {
  try {
    const createdSdSettings = await Sub_Department_Settings.create(sdSettings);
    return [createdSdSettings, null];
  } catch (err) {
    logger.error(`Error while creting sd-settings: ${err.message}.`);
    return [null, err.message];
  }
};

const getSubDepartmentSettingByQuery = async (query) => {
  try {
    const sdSetting = await Sub_Department_Settings.findOne({
      where: query,
    });

    return [sdSetting, null];
  } catch (err) {
    logger.error(
      `Error while fetching sub-department setting by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const getSubDepartmentSettingsByQuery = async (query) => {
  try {
    const sdSettings = await Sub_Department_Settings.findAll({
      where: query,
    });

    return [sdSettings, null];
  } catch (err) {
    logger.error(
      `Error while fetching sub-department settings by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const updateSubDepartmentSettingsByQuery = async (
  query,
  subDepartmentSetting
) => {
  try {
    const data = await Sub_Department_Settings.update(subDepartmentSetting, {
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while updating sub-department settings by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const deleteSubDepartmentSettingsByQuery = async (query) => {
  try {
    const data = await Sub_Department_Settings.destroy({
      where: query,
    });

    return [data, null];
  } catch (err) {
    logger.error(
      `Error while deleting sub-department settings by query: ${err.message}.`
    );
    return [null, err.message];
  }
};

const SubDepartmentSettingsRepository = {
  createSubDepartmentSettings,
  getSubDepartmentSettingByQuery,
  getSubDepartmentSettingsByQuery,
  updateSubDepartmentSettingsByQuery,
  deleteSubDepartmentSettingsByQuery,
};

module.exports = SubDepartmentSettingsRepository;
