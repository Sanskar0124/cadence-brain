// Utils
const logger = require('../../../utils/winston');
const { DB_TABLES } = require('../../../utils/modelEnums');
const {
  CADENCE_LEAD_STATUS,
  WORKFLOW_ACTIONS,
  CADENCE_TYPES,
  CUSTOM_TASK_NODE_ID,
  ACTIVITY_TYPE,
  ACTIVITY_SUBTYPES,
  CRM_INTEGRATIONS,
} = require('../../../utils/enums');

// Packages
const { Op } = require('sequelize');

// Repository
const Repository = require('../../../repository');

// Helpers and Services
const ActivityHelper = require('../../activity');
/*
 * data = {
 * 	salesforce_owner_id,
 * 	oldOwnerSdId
 * }
 * */
const applyOwnerChange = async ({ action, data, lead }) => {
  try {
    if (
      ![
        WORKFLOW_ACTIONS.STOP_CADENCE,
        WORKFLOW_ACTIONS.CONTINUE_CADENCE,
      ].includes(action)
    ) {
      logger.error(
        `Action: ${action} not allowed in applyOwnerChange function.`
      );
      return [
        null,
        `Action: ${action} not allowed in applyOwnerChange function.`,
      ];
    }

    // Fetching new owner
    const [newOwner, errForNewOwner] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      //query: { salesforce_owner_id: data.salesforce_owner_id },
      query: { integration_id: data.integration_id },
      extras: {
        attributes: ['user_id', 'integration_id', 'sd_id'],
      },
    });
    if (errForNewOwner) {
      logger.info('Error while finding new lead owner.');
      return [null, `Error while finding new lead owner: ${errForNewOwner}`];
    }
    if (!newOwner) {
      logger.info('The new owner does not exist in the cadence tool.');
      await Repository.update({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: { lead_id: lead.lead_id },
        update: { status: CADENCE_LEAD_STATUS.STOPPED },
      });

      const [activityFromTemplate, errForActivityFromTemplate] =
        ActivityHelper.getActivityFromTemplates({
          type: ACTIVITY_TYPE.OWNER_CHANGE,
          variables: {
            crm: data?.crm,
          },
          activity: {
            lead_id: lead.lead_id,
            incoming: null,
          },
        });
      await ActivityHelper.activityCreation(
        activityFromTemplate,
        newOwner.user_id
      );

      return [true, null];
    }

    const [leadToCadences, errForLeadToCadences] = await Repository.fetchAll({
      tableName: DB_TABLES.LEADTOCADENCE,
      query: {
        lead_id: lead.lead_id,
      },
      include: {
        [DB_TABLES.CADENCE]: { attributes: ['type', 'cadence_id'] },
      },
      extras: {
        attributes: ['lead_id', 'cadence_id'],
      },
    });
    if (errForLeadToCadences) return [null, errForFetchedLead];

    let flag = 0;
    // Check if the new owner has access to the cadences of the old owner
    for (let leadToCadence of leadToCadences) {
      if (action === WORKFLOW_ACTIONS.STOP_CADENCE) {
        let cadence = leadToCadence?.Cadences?.[0];
        // Check if user has access to the cadence
        switch (cadence.type) {
          case CADENCE_TYPES.PERSONAL: {
            await Repository.destroy({
              tableName: DB_TABLES.LEADTOCADENCE,
              query: {
                cadence_id: cadence.cadence_id,
                lead_id: lead.lead_id,
              },
            });
            // destroy all assigned tasks
            await Repository.destroy({
              tableName: DB_TABLES.TASK,
              query: {
                cadence_id: cadence.cadence_id,
                lead_id: lead.lead_id,
                node_id: {
                  [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                },
              },
            });
            // update all custom task to new owner
            await Repository.update({
              tableName: DB_TABLES.TASK,
              query: {
                lead_id: lead.lead_id,
                node_id: {
                  [Op.in]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                },
              },
              updateObject: {
                user_id: newOwner.user_id,
              },
            });
            break;
          }
          case CADENCE_TYPES.COMPANY: {
            await Repository.update({
              tableName: DB_TABLES.TASK,
              updateObject: { user_id: newOwner.user_id },
              query: {
                cadence_id: {
                  [Op.in]: [0, cadence.cadence_id], // 0 for custom tasks created from lead page
                },
                lead_id: lead.lead_id,
              },
            });
            flag = 1;
            break;
          }
          case CADENCE_TYPES.TEAM: {
            if (data.oldOwnerSdId === newOwner.sd_id) {
              await Repository.update({
                tableName: DB_TABLES.TASK,
                updateObject: { user_id: newOwner.user_id },
                query: {
                  cadence_id: {
                    [Op.in]: [0, cadence.cadence_id], // 0 for custom tasks created from lead page
                  },
                  lead_id: lead.lead_id,
                },
              });
              flag = 1;
            } else {
              await Repository.destroy({
                tableName: DB_TABLES.LEADTOCADENCE,
                query: {
                  cadence_id: cadence.cadence_id,
                  lead_id: lead.lead_id,
                },
              });
              // destroy all assigned tasks
              await Repository.destroy({
                tableName: DB_TABLES.TASK,
                query: {
                  cadence_id: cadence.cadence_id,
                  lead_id: lead.lead_id,
                  node_id: {
                    [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                  },
                },
              });
              // update all custom task to new owner
              await Repository.update({
                tableName: DB_TABLES.TASK,
                query: {
                  lead_id: lead.lead_id,
                  node_id: {
                    [Op.in]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                  },
                },
                updateObject: {
                  user_id: newOwner.user_id,
                },
              });
            }
            break;
          }
        }
        await Repository.update({
          tableName: DB_TABLES.LEADTOCADENCE,
          query: { lead_id: lead.lead_id },
          updateObject: { status: CADENCE_LEAD_STATUS.STOPPED },
        });
        //let activity = {
        //name: `The owner of the lead has been changed from salesforce.`,
        //type: 'owner_change',
        //status: `Owner changed and all cadences stopped.`,
        //lead_id: lead.lead_id,
        //incoming: null,
        //};
        //await ActivityHelper.activityCreation(
        //activity,
        //newOwner.user_id,
        //sendActivity
        //);
      } else if (action === WORKFLOW_ACTIONS.CONTINUE_CADENCE) {
        let cadence = leadToCadence?.Cadences?.[0];
        // Check if user has access to the cadence
        switch (cadence.type) {
          case CADENCE_TYPES.PERSONAL: {
            await Repository.destroy({
              tableName: DB_TABLES.LEADTOCADENCE,
              query: {
                cadence_id: cadence.cadence_id,
                lead_id: lead.lead_id,
              },
            });
            // destroy all assigned tasks
            await Repository.destroy({
              tableName: DB_TABLES.TASK,
              query: {
                cadence_id: cadence.cadence_id,
                lead_id: lead.lead_id,
                node_id: {
                  [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                },
              },
            });
            // update all custom task to new owner
            await Repository.update({
              tableName: DB_TABLES.TASK,
              query: {
                lead_id: lead.lead_id,
                node_id: {
                  [Op.in]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                },
              },
              updateObject: {
                user_id: newOwner.user_id,
              },
            });
            break;
          }
          case CADENCE_TYPES.COMPANY: {
            flag = 1;
            await Repository.update({
              tableName: DB_TABLES.TASK,
              updateObject: { user_id: newOwner.user_id },
              query: {
                cadence_id: {
                  [Op.in]: [0, cadence.cadence_id], // 0 for custom tasks created from lead page
                },
                lead_id: lead.lead_id,
              },
            });
            break;
          }
          case CADENCE_TYPES.TEAM: {
            if (data.oldOwnerSdId === newOwner.sd_id) {
              flag = 1;
              await Repository.update({
                tableName: DB_TABLES.TASK,
                updateObject: { user_id: newOwner.user_id },
                query: {
                  cadence_id: {
                    [Op.in]: [0, cadence.cadence_id], // 0 for custom tasks created from lead page
                  },
                  lead_id: lead.lead_id,
                },
              });
            } else {
              await Repository.destroy({
                tableName: DB_TABLES.LEADTOCADENCE,
                query: {
                  cadence_id: cadence.cadence_id,
                  lead_id: lead.lead_id,
                },
              });
              await Repository.destroy({
                tableName: DB_TABLES.TASK,
                query: {
                  cadence_id: cadence.cadence_id,
                  lead_id: lead.lead_id,
                  node_id: {
                    [Op.notIn]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                  },
                },
              });
              // update all custom task to new owner
              await Repository.update({
                tableName: DB_TABLES.TASK,
                query: {
                  lead_id: lead.lead_id,
                  node_id: {
                    [Op.in]: Object.values(CUSTOM_TASK_NODE_ID).concat([0]),
                  },
                },
                updateObject: {
                  user_id: newOwner.user_id,
                },
              });
            }
            break;
          }
        }
      }
    }

    // Updating lead user id
    const [updatedLead, errForUpdateLead] = await Repository.update({
      tableName: DB_TABLES.LEAD,
      query: { lead_id: lead.lead_id },
      updateObject: { user_id: data.new_user_id },
    });
    if (errForUpdateLead) return [null, 'Error while updating lead.'];

    if (action === WORKFLOW_ACTIONS.CONTINUE_CADENCE) {
      let activity = {};
      if (flag === 0) {
        const [activityFromTemplate, errForActivityFromTemplate] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.OWNER_CHANGE,
            sub_type: ACTIVITY_SUBTYPES.NO_CADENCE_ACCESS,
            variables: {
              crm: data?.crm,
            },
            activity: {
              lead_id: lead.lead_id,
              incoming: null,
            },
          });
        activity = activityFromTemplate;
      } else if (flag === 1) {
        const [activityFromTemplate, errForActivityFromTemplate] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.OWNER_CHANGE,
            variables: {
              crm: data?.crm,
            },
            sub_type: ACTIVITY_SUBTYPES.HAS_CADENCE_ACCESS,
            activity: {
              lead_id: lead.lead_id,
              incoming: null,
            },
          });
        activity = activityFromTemplate;
      }
      await ActivityHelper.activityCreation(activity, newOwner.user_id);
    } else if (action === WORKFLOW_ACTIONS.STOP_CADENCE) {
      let activity = {};
      // stop cadence
      await Repository.update({
        tableName: DB_TABLES.LEADTOCADENCE,
        query: { lead_id: lead.lead_id },
        updateObject: { status: CADENCE_LEAD_STATUS.STOPPED },
      });
      if (flag === 0) {
        const [activityFromTemplate, errForActivityFromTemplate] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.OWNER_CHANGE,
            variables: {
              crm: data?.crm,
            },
            sub_type: ACTIVITY_SUBTYPES.NO_CADENCE_ACCESS,
            activity: {
              lead_id: lead.lead_id,
              incoming: null,
            },
          });
        activity = activityFromTemplate;
      } else if (flag === 1) {
        const [activityFromTemplate, errForActivityFromTemplate] =
          ActivityHelper.getActivityFromTemplates({
            type: ACTIVITY_TYPE.OWNER_CHANGE,
            variables: {
              crm: data?.crm,
            },
            sub_type: ACTIVITY_SUBTYPES.HAS_CADENCE_ACCESS,
            activity: {
              lead_id: lead.lead_id,
              incoming: null,
            },
          });
        activity = activityFromTemplate;
      }
      await ActivityHelper.activityCreation(activity, newOwner.user_id);
      //let stopActivity = {
      //name: `The owner of the lead has been changed from salesforce.`,
      //type: 'owner_change',
      //status: `Owner changed and all cadences stopped.`,
      //lead_id: lead.lead_id,
      //incoming: null,
      //};
      //await ActivityHelper.activityCreation(
      //stopActivity,
      //newOwner.user_id,
      //sendActivity
      //);
    }

    return [true, null];
  } catch (err) {
    logger.error(`Error while applying owner change trigger: `, err);
    return [null, err.message];
  }
};

//(async function test() {
//const [lead, errForLead] = await Repository.fetchOne({
//tableName: DB_TABLES.LEAD,
//query: { lead_id: 5 },
//});
//applyOwnerChange({
//lead,
//action: WORKFLOW_ACTIONS.CONTINUE_CADENCE,
//data: {
//salesforce_owner_id: 1,
//oldOwnerSdId: '4192bff0-e1e0-43ce-a4db-912808c32495',
//},
//sendActivity: () => {},
//});
//})();

module.exports = applyOwnerChange;
