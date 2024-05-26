//Utils
const logger = require('../../utils/winston');
const {
  LEAD_WARMTH,
  ACTIVITY_TYPE,
  LEAD_SCORE_RUBRIKS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { sequelize } = require('../../db/models');
const { Op } = require('sequelize');

// Repository
const Repository = require('../../repository');

const cronResetLeadScore = async () => {
  const t = await sequelize.transaction();
  try {
    const NOW = Date.now();
    // Select all leads that would be reset by cron
    const [leadsToUpdate, errForLeadsToUpdate] = await Repository.fetchAll({
      tableName: DB_TABLES.LEAD,
      query: {
        unix_reset_score: {
          [Op.not]: null,
          [Op.lte]: NOW,
        },
        lead_warmth: LEAD_WARMTH.HOT,
      },
      extras: {
        attributes: ['lead_id', 'lead_score'],
      },
      t,
    });
    if (errForLeadsToUpdate) {
      t.rollback();
      logger.error(
        'An error occured while fetching leads to update to cold leads',
        errForUpdatedLeads
      );
      return;
    }
    // update lead score and statuses of all leads that have a value smaller than now
    // If unix_reset_score is null, then do not
    const [updatedLeads, errForUpdatedLeads] = await Repository.update({
      tableName: DB_TABLES.LEAD,
      updateObject: {
        lead_score: 0,
        lead_warmth: LEAD_WARMTH.COLD,
        unix_reset_score: null,
      },
      query: {
        unix_reset_score: {
          [Op.not]: null,
          [Op.lte]: NOW,
        },
        lead_warmth: LEAD_WARMTH.HOT,
      },
      t,
    });

    if (errForUpdatedLeads) {
      t.rollback();
      logger.error(
        'An error occured while updating lead scores',
        errForUpdatedLeads
      );
      return;
    }
    // Generate array of lead score reasons
    let leadScoreReasonsList = leadsToUpdate?.map((lead) => ({
      lead_id: lead?.lead_id,
      reason: LEAD_SCORE_RUBRIKS.CRON_RESET,
      lead_warmth: LEAD_WARMTH.COLD,
      metadata: 'Lead score expired',
      has_warmth_changed: true,
      score_delta: lead?.lead_score,
    }));

    // Create Entries for lead score reasons
    const [leadScoreReasons, errForLeadScoreReasons] =
      await Repository.bulkCreate({
        tableName: DB_TABLES.LEAD_SCORE_REASONS,
        createObject: leadScoreReasonsList,
        t,
      });

    if (errForLeadScoreReasons) {
      t.rollback();
      logger.error(
        'An error occured while updating lead score reasons',
        errForLeadScoreReasons
      );
      return;
    }

    logger.info('Successfully reset all required lead scores');
    t.commit();
  } catch (err) {
    logger.error('An error occured while updating lead scores', err);
    t.rollback();
  }
};

module.exports = cronResetLeadScore;
