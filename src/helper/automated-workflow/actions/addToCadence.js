// * Utils
const Repository = require('../../../repository');
const {
  CADENCE_TYPES,
  LEAD_INTEGRATION_TYPES,
  CADENCE_STATUS,
  CADENCE_LEAD_STATUS,
  LEAD_STATUS,
} = require('../../../utils/enums');
const { DB_TABLES } = require('../../../utils/modelEnums');
const logger = require('../../../utils/winston');
const { sequelize } = require('../../../db/models');

// * Repository Import
const NodeRepository = require('../../../repository/node.repository');

// * Automated util imports
const {
  createLeadFromSalesforce,
  createContactFromSalesforce,
  createPersonFromPipedrive,
  createContactFromHubspot,
  createContactFromSellsy,
  createContactFromZoho,
  createLeadFromZoho,
  createCandidateFromBullhorn,
  createContactFromBullhorn,
  createLeadFromBullhorn,
  createLeadFromDynamics,
  createContactFromDynamics,
} = require('../utils');

// * Helpers and Services
const { calculateLeadCadenceOrder } = require('../../cadence/');
const CadenceHelper = require('../../cadence');
const recalculateDailyTasksForUsers = require('../../task/recalculateDailyTasksForUsers');
const SalesforceService = require('../../../services/Salesforce');
const LeadHelper = require('../../lead');

const addToCadence = async ({ lead, cadence_id, integration_type, meta }) => {
  try {
    logger.info(`Adding ${lead.integration_id} lead to cadence: ${cadence_id}`);

    // * Integration Id validation
    if (
      lead.integration_id === null ||
      lead.integration_id === undefined ||
      lead.integration_id === ''
    )
      return [null, 'Lead Integration Id is not present'];

    // * Validating presence of user_id
    if (
      lead.user_id === null ||
      lead.user_id === undefined ||
      lead.user_id === ''
    )
      return [null, 'User id is not present'];

    // * Fetch cadence to validate existence
    let [cadence, errFetchingCadence] = await Repository.fetchOne({
      tableName: DB_TABLES.CADENCE,
      query: {
        cadence_id,
      },
    });
    if (errFetchingCadence) return [null, errFetchingCadence];
    if (!cadence) {
      logger.error('Cadence does not exist.');
      return [null, 'Cadence does not exit'];
    }

    // * Check if user has access to cadence
    if (
      (cadence.type === CADENCE_TYPES.PERSONAL &&
        cadence.user_id !== lead.user_id) ||
      (cadence.type === CADENCE_TYPES.TEAM && cadence.sd_id !== lead.sd_id) ||
      (cadence.type === CADENCE_TYPES.COMPANY &&
        cadence.company_id !== lead.company_id)
    ) {
      logger.info('User not part of the cadence.');
      return [null, 'User not part of the cadence.'];
    }

    // * Get new cadence order number
    let [leadToCadenceOrder, _] = await calculateLeadCadenceOrder(cadence_id);
    lead.leadCadenceOrder = leadToCadenceOrder;
    lead.cadence_id = cadence_id;
    lead.cadenceStatus = cadence.status;

    let t = await sequelize.transaction();
    let createdLead, err, duplicate, errForDuplicate;
    let leadStatus, errStatus;
    if (meta?.lead_id && meta?.user_id) {
      [leadStatus, errStatus] = await Repository.fetchOne({
        tableName: DB_TABLES.LEAD,
        query: {
          lead_id: meta.lead_id,
        },
        extras: {
          attributes: ['status'],
        },
      });
    }

    switch (integration_type) {
      case LEAD_INTEGRATION_TYPES.PIPEDRIVE_PERSON:
        if (meta?.lead_id && meta?.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta?.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          [createdLead, err] = await createPersonFromPipedrive(
            {
              lead,
              company_id: lead.company_id,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }

          createdLead = createdLead.createdLead;
        }
        t.commit();

        break;
      case LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          // * Checks if duplicates are present for the given lead
          [duplicate, errForDuplicate] =
            await SalesforceService.checkDuplicates(
              lead.integration_id,
              meta.access_token,
              meta.instance_url
            );
          if (duplicate) lead.duplicate = true;
          [createdLead, err] = await createLeadFromSalesforce(
            {
              lead,
              company_id: lead.company_id,
              access_token: meta.access_token,
              instance_url: meta.instance_url,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();
        // // * Creating cadence Member
        // await SalesforceService.createLeadCadenceMember(
        //   meta.salesforce_cadence_id,
        //   createdLead.integration_id,
        //   cadence.status,
        //   meta.access_token,
        //   meta.instance_url
        // );
        // logger.info('Successfully created cadence member');

        break;
      case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          // Checks if duplicates are present for the given lead
          [duplicate, errForDuplicate] =
            await SalesforceService.checkDuplicates(
              lead.integration_id,
              meta.access_token,
              meta.instance_url
            );
          if (duplicate) lead.duplicate = true;
          [createdLead, err] = await createContactFromSalesforce(
            {
              lead,
              company_id: lead.company_id,
              access_token: meta.access_token,
              instance_url: meta.instance_url,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();
        // console.log('Created lead ===> ');
        // console.log(createdLead);
        // * Creating cadence Member
        // await SalesforceService.createContactCadenceMember(
        //   meta.salesforce_cadence_id,
        //   createdLead.integration_id,
        //   cadence.status,
        //   meta.access_token,
        //   meta.instance_url
        // );
        // logger.info('Successfully created cadence member');

        break;
      case LEAD_INTEGRATION_TYPES.HUBSPOT_CONTACT:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });
          if (errForLink) {
            t.rollback();
            return [null, false];
          }

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };
        } else {
          [createdLead, err] = await createContactFromHubspot(
            {
              lead,
              company_id: lead.company_id,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }

          createdLead = createdLead.createdLead;
        }

        t.commit();

        break;
      case LEAD_INTEGRATION_TYPES.SELLSY_CONTACT:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });
          if (errForLink) {
            t.rollback();
            return [null, false];
          }

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };
        } else {
          [createdLead, err] = await createContactFromSellsy(
            {
              lead,
              company_id: lead.company_id,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }

          createdLead = createdLead.createdLead;
        }

        t.commit();

        break;
      case LEAD_INTEGRATION_TYPES.ZOHO_LEAD:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          [createdLead, err] = await createLeadFromZoho(
            {
              lead,
              company_id: lead.company_id,
              access_token: meta.access_token,
              instance_url: meta.instance_url,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();

        break;
      case LEAD_INTEGRATION_TYPES.ZOHO_CONTACT:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          [createdLead, err] = await createContactFromZoho(
            {
              lead,
              company_id: lead.company_id,
              access_token: meta.access_token,
              instance_url: meta.instance_url,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();
        // console.log('Created lead ===> ');
        // console.log(createdLead);
        // * Creating cadence Member
        // await SalesforceService.createContactCadenceMember(
        //   meta.salesforce_cadence_id,
        //   createdLead.integration_id,
        //   cadence.status,
        //   meta.access_token,
        //   meta.instance_url
        // );
        // logger.info('Successfully created cadeLEAD

        break;
      case LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          [createdLead, err] = await createCandidateFromBullhorn(
            {
              lead,
              company_id: lead.company_id,
              access_token: meta.access_token,
              instance_url: meta.instance_url,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();
        break;
      case LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          [createdLead, err] = await createContactFromBullhorn(
            {
              lead,
              company_id: lead.company_id,
              access_token: meta.access_token,
              instance_url: meta.instance_url,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();
        break;
      case LEAD_INTEGRATION_TYPES.BULLHORN_LEAD:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          [createdLead, err] = await createLeadFromBullhorn(
            {
              lead,
              company_id: lead.company_id,
              access_token: meta.access_token,
              instance_url: meta.instance_url,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();
        break;
      case LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD:
        if (meta.lead_id && meta.user_id) {
          // * Link lead with cadence

          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };

          if (errForLink) {
            t.rollback();
            return [null, false];
          }
        } else {
          [createdLead, err] = await createLeadFromDynamics(
            {
              lead,
              company_id: lead.company_id,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }
          createdLead = createdLead.createdLead;
        }

        t.commit();
        break;
      case LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT:
        if (meta.lead_id && meta.user_id) {
          // * Check if link already exists
          let [link, errFetchingLink] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: meta.lead_id,
              cadence_id,
            },
          });
          if (errFetchingLink) {
            t.rollback();
            return [null, true];
          }
          if (link) {
            t.rollback();
            logger.error('Link already exists');
            return [null, true];
          }

          // * Create Link
          let [unsubscribed, ___] = await LeadHelper.hasLeadUnsubscribed(
            meta.lead_id
          );

          const [createdLink, errForLink] = await Repository.create({
            tableName: DB_TABLES.LEADTOCADENCE,
            createObject: {
              lead_id: meta.lead_id,
              cadence_id,
              status:
                leadStatus.status === LEAD_STATUS.CONVERTED ||
                leadStatus.status === LEAD_STATUS.TRASH
                  ? CADENCE_LEAD_STATUS.STOPPED
                  : cadence.status === CADENCE_STATUS.IN_PROGRESS
                  ? CADENCE_LEAD_STATUS.IN_PROGRESS
                  : CADENCE_STATUS.NOT_STARTED,
              unsubscribed: unsubscribed ?? false,
              lead_cadence_order: leadToCadenceOrder,
            },
            t,
          });
          if (errForLink) {
            t.rollback();
            return [null, false];
          }

          createdLead = {
            lead_id: meta.lead_id,
            user_id: meta.user_id,
          };
        } else {
          [createdLead, err] = await createContactFromDynamics(
            {
              lead,
              company_id: lead.company_id,
            },
            t
          );
          if (err) {
            t.rollback();
            return [null, err];
          }

          createdLead = createdLead.createdLead;
        }

        t.commit();

        break;
      default:
        logger.error(
          'Invalid integration type while adding lead to cadence using automated workflow'
        );
        t.rollback();
        return [null, 'Invalid integration type'];
    }

    if (cadence?.status === CADENCE_STATUS.IN_PROGRESS) {
      // * see if node is already fetched
      let [node, errForNode] = await NodeRepository.getNode({
        cadence_id,
        is_first: 1,
      });
      if (!errForNode && node) {
        const [taskCreated, errForTaskCreated] =
          await CadenceHelper.launchCadenceForLead(
            createdLead,
            cadence_id,
            node,
            lead.user_id,
            true
          );
        /*
         * recalculating after each task created,
         * since it is possible that we get many leads at once in this route
         * In that case tasks wont show up if we calculate after every lead is created
         * */
        if (taskCreated) recalculateDailyTasksForUsers([createdLead.user_id]);
      }
    }

    logger.info('Successfully added lead');
    return [true, null];
  } catch (err) {
    logger.error(
      'An error occurred while attempting to add lead to cadence ',
      err
    );
    return [null, err.message];
  }
};

module.exports = addToCadence;
