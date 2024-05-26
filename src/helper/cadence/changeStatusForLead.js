// Utils
const logger = require('../../utils/winston');
const {
  CADENCE_LEAD_STATUS,
  LEAD_STATUS,
  ACTIVITY_TYPE,
  CADENCE_STATUS,
  ACTIVITY_SUBTYPES,
  CRM_INTEGRATIONS,
} = require('../../utils/enums');
const { LEAD_CADENCE_ORDER_MAX } = require('../../utils/constants');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const CadenceRepository = require('../../repository/cadence.repository');
const LeadRepository = require('../../repository/lead.repository');
const LeadToCadenceRepository = require('../../repository/lead-to-cadence.repository');
const StatusRepository = require('../../repository/status.repository');
const UserRepository = require('../../repository/user-repository');
const TaskRepository = require('../../repository/task.repository');
const Repository = require('../../repository');

// Helpers and services
const resetLeadCadenceOrder = require('../lead/resetLeadCadenceOrder');
const ActivityHelper = require('../activity');
const SalesforceService = require('../../services/Salesforce');
const {
  updateCadenceMemberStatusInSalesforce,
} = require('./updateCadenceMemberStatus');
const AccessTokenHelper = require('../access-token');
const AutomatedTasksHelper = require('../automated-tasks');
const updateLeadCadenceOrderForCadence = require('../lead-to-cadence/updateLeadCadenceOrderForCadence');

const pauseCadenceForLead = async (
  lead_id,
  cadence_ids,
  pauseFor,
  user = null,
  message_id = null
) => {
  try {
    const [lead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id },
      include: {
        [DB_TABLES.ACCOUNT]: {},
        [DB_TABLES.LEAD_PHONE_NUMBER]: {},
        [DB_TABLES.LEAD_EMAIL]: {},
        [DB_TABLES.LEADTOCADENCE]: { [DB_TABLES.CADENCE]: {} },
        [DB_TABLES.USER]: {
          [DB_TABLES.COMPANY]: { [DB_TABLES.COMPANY_SETTINGS]: {} },
          [DB_TABLES.USER_TOKEN]: {
            attributes: [
              'lusha_service_enabled',
              'kaspr_service_enabled',
              'encrypted_salesforce_instance_url',
              'salesforce_instance_url',
            ],
          },
        },
      },
    });

    const [cadences, errForCadences] = await CadenceRepository.getCadences({
      cadence_id: {
        [Op.in]: cadence_ids,
      },
    });
    // * loop through cadences
    for (let cadence of cadences) {
      // if (cadence.status === CADENCE_STATUS.NOT_STARTED) {
      //   logger.info(
      //     `Not pausing for cadence: ${cadence?.cadence_id} since it's status is ${cadence?.status}.`
      //   );
      //   continue;
      // }

      const [leadCadenceLink, errForLeadCadenceLink] =
        await LeadToCadenceRepository.getLeadToCadenceLinkByLeadQuery({
          lead_id,
          cadence_id: cadence?.cadence_id,
        });

      if (
        [
          CADENCE_LEAD_STATUS.STOPPED,
          CADENCE_LEAD_STATUS.COMPLETED,
          CADENCE_LEAD_STATUS.PAUSED,
        ].includes(leadCadenceLink.status)
      ) {
        return [null, 'Cannot pause cadence for this lead.'];
      }

      // * pause this cadence for lead
      const [data, err] =
        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_id,
            cadence_id: cadence?.cadence_id,
          },
          {
            status: CADENCE_LEAD_STATUS.PAUSED,
            lead_cadence_order: LEAD_CADENCE_ORDER_MAX,
            unix_resume_at: pauseFor,
          }
        );

      // * decrement all next leads in cadence by 1, only if the link was previously not paused
      if (
        !errForLeadCadenceLink &&
        leadCadenceLink &&
        leadCadenceLink?.status !== CADENCE_LEAD_STATUS.PAUSED
      ) {
        // * fetch lead-cadence-links
        const [leadCadenceIds, errForLeadCadenceIds] =
          await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery(
            {
              cadence_id: cadence?.cadence_id,
              lead_cadence_order: {
                [Op.ne]: LEAD_CADENCE_ORDER_MAX,
              },
              created_at: {
                [Op.gt]: leadCadenceLink?.created_at,
              },
            },
            {
              user_id: lead.user_id,
            }
          );

        if (!errForLeadCadenceIds) {
          await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
            {
              lead_cadence_id: {
                [Op.in]: leadCadenceIds.map(
                  (leadCadenceId) => leadCadenceId?.lead_cadence_id
                ),
              },
            },
            {
              // * decrement lead_cadence_order for all leads after the current lead by 1
              lead_cadence_order: sequelize.literal(`lead_cadence_order - 1`),
            }
          );
        }
      }

      // * Fetch latest task

      const [task, errForTask] = await TaskRepository.getTask({
        lead_id,
        cadence_id: cadence.cadence_id,
        completed: false,
        is_skipped: false,
      });
      if (errForTask) logger.error(errForTask);

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.PAUSE_CADENCE,
          sub_type: pauseFor
            ? ACTIVITY_SUBTYPES.PAUSE_FOR_LEAD
            : ACTIVITY_SUBTYPES.LEAD,
          variables: {
            cadence_name: cadence.name,
            pause_for: pauseFor,
            first_name: user?.first_name || null,
            last_name: user?.last_name || null,
          },
          activity: {
            cadence_id: cadence.cadence_id,
            lead_id: lead.lead_id,
            incoming: null,
            node_id: task?.node_id ?? null,
            message_id: message_id ?? null,
          },
        });

      const [sendingActivity, errForSendingActivity] =
        await ActivityHelper.activityCreation(
          activityFromTemplate,
          lead.user_id
        );
      if (errForSendingActivity) logger.error(errForSendingActivity);

      const [updatedStatusInSalesForce, errForUpdatedStatusInSalesForce] =
        await updateCadenceMemberStatusInSalesforce(lead, cadence, 'paused');
      if (errForUpdatedStatusInSalesForce)
        logger.error(
          'Error while updating status in saleforce while pausing cadence: ' +
            errForUpdatedStatusInSalesForce
        );
    }
    return ['Paused required lead.', null];
  } catch (err) {
    console.log(err);
    logger.info(`Error while pausing lead for a cadence: ${err.message}`);
    return [null, err.message];
  }
};

const stopCadence = async ({ lead_id, reason, t, user = null }) => {
  try {
    let [lead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id },
      t,
    });
    if (errForLead) return [null, errForLead];
    if (!lead) return [null, 'Lead not found'];
    await Repository.update({
      tableName: DB_TABLES.LEADTOCADENCE,
      updateObject: {
        status: CADENCE_LEAD_STATUS.STOPPED,
      },
      query: {
        lead_id,
      },
      t,
    });

    const [activityFromTemplate, errForActivityFromTemplate] =
      ActivityHelper.getActivityFromTemplates({
        type: ACTIVITY_TYPE.STOP_CADENCE,
        sub_type: ACTIVITY_SUBTYPES.FOR_ALL,
        activity: {
          lead_id: lead.lead_id,
          incoming: null,
        },
        variables: {
          first_name: user?.first_name || null,
          last_name: user?.last_name || null,
        },
      });

    if (reason) activity.status += ` Reason: ${reason}.`;

    ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);

    const [leadToCadences, errForLeadToCadences] = await Repository.fetchAll({
      tableName: DB_TABLES.LEADTOCADENCE,
      query: {
        lead_id,
      },
      include: {
        [DB_TABLES.CADENCE]: {
          attributes: ['salesforce_cadence_id'],
        },
      },
      t,
    });

    if (leadToCadences?.length) {
      for (let leadToCadence of leadToCadences) {
        if (leadToCadence?.Cadences?.[0])
          await updateCadenceMemberStatusInSalesforce(
            lead,
            leadToCadence?.Cadences?.[0],
            CADENCE_LEAD_STATUS.STOPPED
          );
      }
    }
    logger.info(`Stopped lead: ${lead.lead_id}.`);
    return ['Stopped lead.', null];
  } catch (err) {
    logger.info(`Error while stopping lead for a cadence: ${err.message}`);
    return [null, err.message];
  }
};

const stopCadenceForLeadOld = async (
  lead_id,
  status,
  reason,
  cadence_ids,
  user = null
) => {
  try {
    // * Check if status sent is valid or not
    if (!Object.values(LEAD_STATUS).includes(status))
      return [res, 'Invalid status sent.'];

    let [lead, errForLead] = await LeadRepository.getLeadByQuery({ lead_id });
    if (errForLead) return [null, errForLead];
    if (!lead) return [null, 'Lead not found'];

    let [userForLead, errorForUserForLead] =
      await UserRepository.findUserByQuery({
        user_id: lead.user_id,
      });
    if (errorForUserForLead) return [null, errorForUserForLead];

    if ([LEAD_STATUS.CONVERTED, LEAD_STATUS.TRASH].includes(lead.status))
      return [null, `Cannot stop cadence for a lead. It's already stopped.`];

    // Fetching access_token and instance url
    const [{ access_token, instance_url }, errForAccessToken] =
      await AccessTokenHelper.getAccessToken({
        integration_type: CRM_INTEGRATIONS.SALESFORCE,
        user_id: lead.user_id,
      });
    if (errForAccessToken === 'Please log in with salesforce')
      return [null, 'Please log in with salesforce to stop there.'];

    //get todays date for converted/trash activities
    const today = new Date().toLocaleDateString('en-GB', {
      timeZone: userForLead.timezone,
    });
    if (cadence_ids.length === 0) {
      const [updateData, errForUpdate] = await LeadRepository.updateLead({
        lead_id,
        status,
        stopped_cadence: true,
      });
      if (errForUpdate) return [null, errForUpdate];

      // * create a entry in status table
      await StatusRepository.createStatus({
        lead_id,
        status,
        message: reason,
      });

      const [data, err] =
        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_id,
          },
          {
            status: CADENCE_LEAD_STATUS.STOPPED,
          }
        );

      if (status === LEAD_STATUS.CONVERTED) {
        const activity_status = `Lead converted on ${today}`;
        let activity = {
          name: 'Converted Lead',
          status: activity_status,
          type: ACTIVITY_TYPE.LEAD_CONVERTED,
          lead_id: lead_id,
          incoming: null,
        };
        const [sendingActivity, errForSendingActivity] =
          await ActivityHelper.activityCreation(activity, lead.user_id);

        if (errForSendingActivity)
          logger.error(
            `Error while creating activity: ${errForSendingActivity}`
          );
        // Commented for bastien
        if (lead.salesforce_lead_id) {
          const [_, errForConvert] = await SalesforceService.convertLead(
            lead.salesforce_lead_id,
            access_token
          );
          if (errForConvert) return [null, errForConvert];
        } else return ['', null];
      } else if (status === LEAD_STATUS.TRASH) {
        if (lead.salesforce_lead_id) {
          const [__, errForTrash] = await SalesforceService.DisqualifyLead(
            reason,
            lead.salesforce_lead_id,
            access_token,
            instance_url
          );
          if (errForTrash) return [null, errForTrash];

          const activity_status = `Lead disqualified on ${today}`;
          let activity = {
            name: 'Disqualify Lead',
            status: activity_status,
            type: ACTIVITY_TYPE.LEAD_DISQUALIFIED,
            lead_id: lead_id,
            incoming: null,
          };
          const [sendingActivity, errForSendingActivity] =
            await ActivityHelper.activityCreation(activity, lead.user_id);
          if (errForSendingActivity)
            logger.error(
              `Error while creating activity: ${errForSendingActivity}`
            );
        } else {
          const [__, errForTrash] = await SalesforceService.DisqualifyContact(
            reason,
            lead.salesforce_contact_id,
            access_token,
            instance_url
          );
          if (errForTrash) return [null, errForTrash];

          const activity_status = `Contact Disqualified on ${today}`;
          let activity = {
            name: 'Disqualified CONTACT',
            status: activity_status,
            type: ACTIVITY_TYPE.CONTACT_DISQUALIFIED,
            lead_id: lead_id,
            incoming: null,
          };
          const [sendingActivity, errForSendingActivity] =
            await ActivityHelper.activityCreation(activity, lead.user_id);
          if (errForSendingActivity)
            logger.error(
              `Error while creating activity: ${errForSendingActivity}`
            );
        }
      }

      return ['Stopped lead.', null];
    }

    const [cadences, errForCadences] = await CadenceRepository.getCadences({
      cadence_id: {
        [Op.in]: cadence_ids,
      },
    });

    // * update lead status
    const [data, err] = await LeadRepository.updateLead({
      lead_id,
      status,
      stopped_cadence: true,
    });
    if (err) return [null, err];

    // * create a entry in status table
    await StatusRepository.createStatus({
      lead_id,
      status,
      message: reason,
    });

    // * loop through cadences
    for (let cadence of cadences) {
      /*      if (cadence.status === CADENCE_STATUS.NOT_STARTED) {*/
      /*logger.info(*/
      /*`Not stopping for cadence: ${cadence?.cadence_id} since it's status is ${cadence?.status}.`*/
      /*);*/
      /*continue;*/
      /*}*/

      const [leadCadenceLink, errForLeadCadenceLink] =
        await LeadToCadenceRepository.getLeadToCadenceLinkByLeadQuery({
          lead_id,
          cadence_id: cadence?.cadence_id,
        });

      // * stop this cadence for lead
      const [data, err] =
        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_id,
            cadence_id: cadence?.cadence_id,
          },
          {
            status: CADENCE_LEAD_STATUS.STOPPED,
            lead_cadence_order: LEAD_CADENCE_ORDER_MAX, // * update lead_cadence_order to max
          }
        );

      if (
        !errForLeadCadenceLink &&
        leadCadenceLink &&
        leadCadenceLink?.status !== CADENCE_LEAD_STATUS.STOPPED
      ) {
        // * fetch lead-cadence-links
        const [leadCadenceIds, errForLeadCadenceIds] =
          await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery(
            {
              cadence_id: cadence?.cadence_id,
              lead_cadence_order: {
                [Op.ne]: LEAD_CADENCE_ORDER_MAX,
              },
              created_at: {
                [Op.gt]: leadCadenceLink?.created_at,
              },
            },
            {
              user_id: lead.user_id,
            }
          );

        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_cadence_id: {
              [Op.in]: leadCadenceIds.map(
                (leadCadenceId) => leadCadenceId?.lead_cadence_id
              ),
            },
          },

          {
            // * decrement lead_cadence_order for all leads after the current lead by 1
            lead_cadence_order: sequelize.literal(`lead_cadence_order - 1`),
          }
        );
      }

      await updateCadenceMemberStatusInSalesforce(lead, cadence, 'stopped');

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.STOP_CADENCE,
          variables: {
            cadence_name: cadence.name,
            first_name: user?.first_name || null,
            last_name: user?.last_name || null,
          },
          activity: {
            lead_id: lead_id,
            incoming: null,
          },
        });

      const [_, errForSendingActivity] = await ActivityHelper.activityCreation(
        activityFromTemplate,
        lead.user_id
      );
      if (errForSendingActivity) logger.error(errForSendingActivity);
    }

    // * salesforce operations
    if (status === LEAD_STATUS.CONVERTED) {
      const activity_status = `Lead Converted on ${today}`;
      let activity = {
        name: 'Converted Lead',
        status: activity_status,
        type: ACTIVITY_TYPE.LEAD_CONVERTED,
        lead_id: lead.lead_id,
        incoming: null,
      };
      const [sendingActivity, errForSendingActivity] =
        await ActivityHelper.activityCreation(activity, lead.user_id);
      if (errForSendingActivity)
        logger.error(`Error while creating activity: ${errForSendingActivity}`);
      if (lead.salesforce_lead_id) {
        const [_, errForConvert] = await SalesforceService.convertLead(
          lead.salesforce_lead_id,
          access_token
        );
        if (errForConvert) return [null, `Salesforce error: ${errForConvert}`];
      } else return ['', null];
    } else if (status === LEAD_STATUS.TRASH) {
      if (lead.salesforce_lead_id) {
        const [__, errForTrash] = await SalesforceService.DisqualifyLead(
          reason,
          lead.salesforce_lead_id,
          access_token,
          instance_url
        );
        if (errForTrash) return [null, `Salesforce error: ${errForTrash}`];

        const activity_status = `Lead Disqualified on ${today}`;
        let activity = {
          name: 'Disqualified Lead',
          status: activity_status,
          type: ACTIVITY_TYPE.LEAD_DISQUALIFIED,
          lead_id: lead.lead_id,
          incoming: null,
        };
        const [sendingActivity, errForSendingActivity] =
          await ActivityHelper.activityCreation(activity, lead.user_id);
        if (errForSendingActivity)
          logger.error(
            `Error while creating activity: ${errForSendingActivity}`
          );
      } else {
        const [__, errForTrash] = await SalesforceService.DisqualifyContact(
          reason,
          lead.salesforce_contact_id,
          access_token,
          instance_url
        );
        if (errForTrash) return [null, `Salesforce error: ${errForTrash}`];

        const activity_status = `Contact Disqualified on ${today}`;
        let activity = {
          name: 'Disqualified CONTACT',
          status: activity_status,
          type: ACTIVITY_TYPE.CONTACT_DISQUALIFIED,
          lead_id: lead.lead_id,
          incoming: null,
        };
        const [sendingActivity, errForSendingActivity] =
          await ActivityHelper.activityCreation(activity, lead.user_id);
        if (errForSendingActivity)
          logger.error(
            `Error while creating activity: ${errForSendingActivity}`
          );
      }
    }
    return ['Stopped lead.', null];
  } catch (err) {
    logger.info(`Error while stopping lead for a cadence: ${err.message}`);
    return [null, err.message];
  }
};

const stopCadenceForLead = async (
  lead_id,
  status,
  reason,
  cadence_ids,
  user = null
) => {
  try {
    // * Check if status sent is valid or not
    //if (!Object.values(LEAD_STATUS).includes(status))
    //return [res, 'Invalid status sent.'];

    let [lead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id },
      include: {
        [DB_TABLES.ACCOUNT]: {},
        [DB_TABLES.LEAD_PHONE_NUMBER]: {},
        [DB_TABLES.LEAD_EMAIL]: {},
        [DB_TABLES.LEADTOCADENCE]: { [DB_TABLES.CADENCE]: {} },
        [DB_TABLES.USER]: {
          [DB_TABLES.COMPANY]: { [DB_TABLES.COMPANY_SETTINGS]: {} },
          [DB_TABLES.USER_TOKEN]: {
            attributes: [
              'lusha_service_enabled',
              'kaspr_service_enabled',
              'encrypted_salesforce_instance_url',
              'salesforce_instance_url',
            ],
          },
        },
      },
    });
    if (errForLead) return [null, errForLead];
    if (!lead) return [null, 'Lead not found'];

    let [userForLead, errorForUserForLead] =
      await UserRepository.findUserByQuery({
        user_id: lead.user_id,
      });
    if (errorForUserForLead) return [null, errorForUserForLead];

    if ([LEAD_STATUS.CONVERTED, LEAD_STATUS.TRASH].includes(lead.status))
      return [null, `Cannot stop cadence for this lead. It's already stopped.`];

    //get todays date for converted/trash activities
    const today = new Date().toLocaleDateString('en-GB', {
      timeZone: userForLead.timezone,
    });

    if (cadence_ids.length === 0) {
      //const [updateData, errForUpdate] = await LeadRepository.updateLead({
      //lead_id,
      //status,
      //});
      //if (errForUpdate) return [null, errForUpdate];

      // * create a entry in status table
      //await StatusRepository.createStatus({
      //lead_id,
      //status,
      //message: 'Stopped cadence.',
      //});

      const [data, err] =
        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_id,
          },
          {
            status: CADENCE_LEAD_STATUS.STOPPED,
          }
        );

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.STOP_CADENCE,
          sub_type: ACTIVITY_SUBTYPES.FOR_ALL,
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
            node_id: null,
          },
          variables: {
            first_name: user?.first_name || null,
            last_name: user?.last_name || null,
          },
        });

      const [sendingActivity, errForSendingActivity] =
        await ActivityHelper.activityCreation(
          activityFromTemplate,
          lead.user_id
        );
      if (errForSendingActivity)
        logger.error(`Error while creating activity: ${errForSendingActivity}`);

      return ['Stopped lead.', null];
    }

    const [cadences, errForCadences] = await CadenceRepository.getCadences({
      cadence_id: {
        [Op.in]: cadence_ids,
      },
    });

    //// * update lead status
    //const [data, err] = await LeadRepository.updateLead({
    //lead_id,
    //status,
    //});
    //if (err) return [null, err];

    // * create a entry in status table
    //await StatusRepository.createStatus({
    //lead_id,
    //status,
    //message: reason,
    //});

    // * loop through cadences
    for (let cadence of cadences) {
      const [leadCadenceLink, errForLeadCadenceLink] =
        await LeadToCadenceRepository.getLeadToCadenceLinkByLeadQuery({
          lead_id,
          cadence_id: cadence?.cadence_id,
        });

      if (
        [CADENCE_LEAD_STATUS.STOPPED, CADENCE_LEAD_STATUS.COMPLETED].includes(
          leadCadenceLink.status
        )
      ) {
        return [null, 'Cannot stop cadence for this lead.'];
      }

      // * stop this cadence for lead
      const [data, err] =
        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_id,
            cadence_id: cadence?.cadence_id,
          },
          {
            status: CADENCE_LEAD_STATUS.STOPPED,
            lead_cadence_order: LEAD_CADENCE_ORDER_MAX, // * update lead_cadence_order to max
          }
        );

      if (
        !errForLeadCadenceLink &&
        leadCadenceLink &&
        leadCadenceLink?.status !== CADENCE_LEAD_STATUS.STOPPED
      ) {
        // * fetch lead-cadence-links
        const [leadCadenceIds, errForLeadCadenceIds] =
          await LeadToCadenceRepository.getLeadToCadenceLinksByLeadQuery(
            {
              cadence_id: cadence?.cadence_id,
              lead_cadence_order: {
                [Op.ne]: LEAD_CADENCE_ORDER_MAX,
              },
              created_at: {
                [Op.gt]: leadCadenceLink?.created_at,
              },
            },
            {
              user_id: lead.user_id,
            }
          );

        await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
          {
            lead_cadence_id: {
              [Op.in]: leadCadenceIds.map(
                (leadCadenceId) => leadCadenceId?.lead_cadence_id
              ),
            },
          },

          {
            // * decrement lead_cadence_order for all leads after the current lead by 1
            lead_cadence_order: sequelize.literal(`lead_cadence_order - 1`),
          }
        );

        // * Fetch latest task
        const [task, errForTask] = await TaskRepository.getTask({
          lead_id,
          cadence_id: cadence.cadence_id,
          completed: false,
          is_skipped: false,
        });
        if (errForTask) logger.error(errForTask);

        const [activityFromTemplate, errForActivityFromTemplate] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.STOP_CADENCE,
            sub_type: ACTIVITY_SUBTYPES.DEFAULT,
            variables: {
              cadence_name: cadence.name,
              first_name: user?.first_name || null,
              last_name: user?.last_name || null,
            },
            activity: {
              lead_id: lead.lead_id,
              incoming: null,
              node_id: task?.node_id ?? null,
            },
          });

        const [sendingActivity, errForSendingActivity] =
          await ActivityHelper.activityCreation(
            activityFromTemplate,
            lead.user_id
          );
        if (errForSendingActivity)
          logger.error(
            `Error while creating activity: ${errForSendingActivity}`
          );
      }
    }

    return ['Stopped lead.', null];
  } catch (err) {
    console.log(err);
    logger.info(`Error while stopping lead for a cadence: `, err);
    return [null, err.message];
  }
};

const resumeCadenceForLead = async (lead_id, cadence_id) => {
  try {
    logger.info('resuming cadence for lead');

    let [fetchedLead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id },
      include: {
        [DB_TABLES.ACCOUNT]: {},
        [DB_TABLES.LEAD_PHONE_NUMBER]: {},
        [DB_TABLES.LEAD_EMAIL]: {},
        [DB_TABLES.LEADTOCADENCE]: { [DB_TABLES.CADENCE]: {} },
        [DB_TABLES.USER]: {
          [DB_TABLES.COMPANY]: { [DB_TABLES.COMPANY_SETTINGS]: {} },
          [DB_TABLES.USER_TOKEN]: {
            attributes: [
              'lusha_service_enabled',
              'kaspr_service_enabled',
              'encrypted_salesforce_instance_url',
              'salesforce_instance_url',
            ],
          },
        },
      },
    });
    if (errForLead) return [null, errForLead];
    if (!fetchedLead) return [null, 'Lead not found'];

    const [cadence, errForCadence] = await CadenceRepository.getCadence({
      cadence_id,
    });
    if (errForCadence) return [null, errForCadence];
    if (!cadence) return [null, 'Cadence not found'];

    if (
      [CADENCE_STATUS.PAUSED, CADENCE_STATUS.NOT_STARTED].includes(
        cadence.status
      )
    )
      return [null, `Cannot resume the cadence since the cadence is paused.`];

    if (
      [LEAD_STATUS.CONVERTED, LEAD_STATUS.TRASH].includes(fetchedLead?.status)
    )
      return [
        null,
        `Cannot resume cadence for a lead since its already stopped.`,
      ];

    const [leadCadenceLink, errForLeadCadenceLink] =
      await LeadToCadenceRepository.getLeadToCadenceLinkByLeadQuery({
        lead_id,
        cadence_id: cadence_id,
      });

    if (
      [
        CADENCE_LEAD_STATUS.IN_PROGRESS,
        CADENCE_LEAD_STATUS.COMPLETED,
        CADENCE_LEAD_STATUS.STOPPED,
      ].includes(leadCadenceLink.status)
    ) {
      return [null, 'Cannot resume cadence for this lead.'];
    }

    await LeadToCadenceRepository.updateLeadToCadenceLinkByQuery(
      {
        lead_id,
        cadence_id,
      },
      {
        status: CADENCE_LEAD_STATUS.IN_PROGRESS,
        unix_resume_at: null,
      }
    );

    // Resetting lead cadence order
    await resetLeadCadenceOrder(fetchedLead, cadence_id);

    // * Fetch latest task

    const [task, errForTask] = await TaskRepository.getTask({
      lead_id: fetchedLead.lead_id,
      cadence_id: cadence.cadence_id,
      completed: false,
      is_skipped: false,
    });
    if (errForTask) logger.error(errForTask);

    let activity = {
      name: `${cadence.name} has been resumed for this lead`,
      cadence_id: cadence.cadence_id,
      status: 'Cadence has been resumed',
      type: ACTIVITY_TYPE.RESUME_CADENCE,
      lead_id: fetchedLead.lead_id,
      incoming: null,
      node_id: task?.node_id ?? null,
    };
    const [sendingActivity, errForSendingActivity] =
      await ActivityHelper.activityCreation(activity, fetchedLead.user_id);
    if (errForSendingActivity)
      logger.error(`Error while creating activity: ${errForSendingActivity}`);

    // Updating cadence member status in salesforce
    await updateCadenceMemberStatusInSalesforce(
      fetchedLead,
      cadence,
      CADENCE_LEAD_STATUS.IN_PROGRESS
    );

    return ['Successfully resumed cadence for lead.', null];
  } catch (err) {
    logger.info(`Error while resuming lead for a cadence: `, err);
    return [null, err.message];
  }
};

/**
 * Stops all associated cadences for leads
 * @param {Array<Number>} lead_ids
 * @param {sequelize.Transaction} t
 * @returns {Promise<[result: String, err: Error]>}
 */
const stopAllCadencesForLead = async (lead_ids, t) => {
  try {
    const cadence_ids = [];

    for (const lead_id of lead_ids) {
      let [lead, errForLead] = await Repository.fetchOne({
        tableName: DB_TABLES.LEAD,
        query: { lead_id },
        include: {
          [DB_TABLES.LEADTOCADENCE]: { [DB_TABLES.CADENCE]: {} },
          [DB_TABLES.USER]: {},
        },
        t,
      });
      if (errForLead) return [null, errForLead];
      // Lead not found continue to next lead
      if (!lead) continue;

      if ([LEAD_STATUS.CONVERTED, LEAD_STATUS.TRASH].includes(lead.status))
        continue;

      const leadToCadences = lead?.LeadToCadences ?? [];

      // * loop through cadences
      for (const leadCadenceLink of leadToCadences) {
        if (
          [CADENCE_LEAD_STATUS.STOPPED, CADENCE_LEAD_STATUS.COMPLETED].includes(
            leadCadenceLink.status
          )
        )
          continue;

        // * stop this cadence for lead

        const [updateLeadToCadenceStatus, errForStatusUpdate] =
          await Repository.update({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id,
              cadence_id: leadCadenceLink.cadence_id,
            },
            updateObject: {
              status: CADENCE_LEAD_STATUS.STOPPED,
              lead_cadence_order: LEAD_CADENCE_ORDER_MAX,
            },
            t,
          });
        if (errForStatusUpdate) return [null, errForStatusUpdate];

        // *  add cadence_id to array for order calculation
        if (
          leadCadenceLink &&
          leadCadenceLink.status !== CADENCE_LEAD_STATUS.STOPPED
        )
          cadence_ids.push(leadCadenceLink.cadence_id);
      }

      // * Create all cadences stopped activity for lead
      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.STOP_CADENCE,
          sub_type: ACTIVITY_SUBTYPES.BULK,
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
          },
        });
      if (errForActivityFromTemplate) {
        logger.error(
          `Error while fetching activity from template: `,
          errForActivityFromTemplate
        );
        continue;
      }

      ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);
    }

    // * Order updated cadence_ids
    for (const cadence_id of [...new Set(cadence_ids)])
      updateLeadCadenceOrderForCadence(cadence_id);

    // * Skip automated tasks for all leads

    await AutomatedTasksHelper.deleteAutomatedTasks({
      lead_id: lead_ids,
    });

    return ['Stopped cadences for leads', null];
  } catch (err) {
    logger.error('Error while pausing all cadences for leads:', err);
    return [null, err.message];
  }
};

/**
 * Pauses all associated cadences for leads
 * @param {Array<Number>} lead_ids
 * @param {sequelize.Transaction} t
 * @returns {Promise<[result: String, err: Error]>}
 */
const pauseAllCadencesForLead = async (lead_ids, t) => {
  try {
    const cadence_ids = [];

    for (const lead_id of lead_ids) {
      const [lead, errForLead] = await Repository.fetchOne({
        tableName: DB_TABLES.LEAD,
        query: { lead_id },
        include: {
          [DB_TABLES.LEADTOCADENCE]: { [DB_TABLES.CADENCE]: {} },
        },
        t,
      });
      if (errForLead) return [null, errForLead];
      // Lead not found continue to next lead
      if (!lead) continue;

      const leadToCadences = lead?.LeadToCadences ?? [];

      // * loop through cadences
      for (const leadCadenceLink of leadToCadences) {
        if (
          [
            CADENCE_LEAD_STATUS.STOPPED,
            CADENCE_LEAD_STATUS.COMPLETED,
            CADENCE_LEAD_STATUS.PAUSED,
          ].includes(leadCadenceLink.status)
        )
          continue;

        // * pause this cadence for lead

        const [updateLeadToCadenceStatus, errForStatusUpdate] =
          await Repository.update({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id,
              cadence_id: leadCadenceLink.cadence_id,
            },
            updateObject: {
              status: CADENCE_LEAD_STATUS.PAUSED,
              lead_cadence_order: LEAD_CADENCE_ORDER_MAX,
              unix_resume_at: pauseFor,
            },
            t,
          });
        if (errForStatusUpdate) return [null, errForStatusUpdate];

        // * decrement all next leads in cadence by 1, only if the link was previously not paused
        if (
          leadCadenceLink &&
          leadCadenceLink?.status !== CADENCE_LEAD_STATUS.PAUSED
        )
          cadence_ids.push(leadCadenceLink.cadence_id);

        updateCadenceMemberStatusInSalesforce(
          lead,
          leadCadenceLink.Cadences?.[0],
          'paused'
        );
      }

      // * Create all cadences paused activity for lead
      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.PAUSE_CADENCE,
          sub_type: ACTIVITY_SUBTYPES.BULK,
          // variables: {
          //   pause_for: pauseFor,
          // },
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
          },
        });
      if (errForActivityFromTemplate) {
        logger.error(
          `Error while fetching activity from template: `,
          errForActivityFromTemplate
        );
        continue;
      }

      ActivityHelper.activityCreation(activityFromTemplate, lead.user_id);
    }

    // * Order updated cadence_ids
    for (const cadence_id of [...new Set(cadence_ids)])
      updateLeadCadenceOrderForCadence(cadence_id);

    return ['Paused cadences for leads.', null];
  } catch (err) {
    logger.error('Error while pausing all cadences for leads:', err);
    return [null, err.message];
  }
};

module.exports = {
  pauseCadenceForLead,
  stopCadenceForLeadOld,
  stopCadenceForLead,
  resumeCadenceForLead,
  stopCadence,
  stopAllCadencesForLead,
  pauseAllCadencesForLead,
};
