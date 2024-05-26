// Utils
const logger = require('../../utils/winston');

const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repository
const Repository = require('../../repository');

// Helpers and services
const NodeHelper = require('../node');

const updateCadenceIntegrationTypeForSheetsIntegration = async (
  cadence_ids,
  t
) => {
  try {
    if (cadence_ids.length < 0) {
      logger.info('cadence_ids is empty');
      return ['cadence_ids is empty', null];
    }

    let [fetchCadenceIds, errForFetchingCadenceIds] = await Repository.fetchAll(
      {
        tableName: DB_TABLES.LEADTOCADENCE,
        query: {
          cadence_id: {
            [Op.in]: cadence_ids,
          },
        },
        extras: {
          group: ['cadence_id'],
          attributes: ['cadence_id'],
        },
        t,
      }
    );
    if (errForFetchingCadenceIds)
      return [
        null,
        `Error while fetching lead to cadnce: ${errForFetchingCadenceIds}`,
      ];

    const extractedCadenceIds = fetchCadenceIds.map((item) => item.cadence_id);
    // Filter cadence_ids that are not present in extractedCadenceIds
    const emptyCadenceIds = cadence_ids.filter(
      (id) => !extractedCadenceIds.includes(id)
    );

    let [updateCadencveIntegrationType, errForUpdatingCadenceIntegrationType] =
      await Repository.update({
        tableName: DB_TABLES.CADENCE,
        query: {
          cadence_id: {
            [Op.in]: emptyCadenceIds,
          },
        },
        updateObject: { integration_type: null },
        t,
      });
    if (errForUpdatingCadenceIntegrationType)
      return [
        null,
        `Error while updating cadence integration type: ${errForUpdatingCadenceIntegrationType} `,
      ];

    return [
      'Successfully updated cadence integration type for sheets integration',
      null,
    ];
  } catch (err) {
    logger.error(
      `Error while updating cadence integration type for sheets integration: `,
      err
    );
    return [null, err.message];
  }
};

module.exports = updateCadenceIntegrationTypeForSheetsIntegration;
