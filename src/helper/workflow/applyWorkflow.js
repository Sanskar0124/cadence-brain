// Utils
const logger = require('../../utils/winston');
const {
  WORKFLOW_ACTIONS,
  WORKFLOW_TRIGGERS,
  CRM_INTEGRATIONS,
  LEAD_INTEGRATION_TYPES,
  WEBHOOK_TYPE,
  TASK_NAMES_BY_TYPE,
  TASK_STATUSES,
  CADENCE_LEAD_STATUS,
  CUSTOM_TASK_NODE_ID,
  HIRING_INTEGRATIONS,
  DEFAULT_INTEGRATION_STATUS,
  DEFAULT_BULLHORN_INTEGRATION_STATUS,
} = require('../../utils/enums');
const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');

// Db
const { sequelize } = require('../../db/models');

// Packages
const axios = require('axios');
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Helpers and services
const fetchWorkflow = require('./fetchWorkflow');
const stopCadenceForLead = require('../lead/stopCadenceForLead');
const changeOwner = require('../lead/changeOwner');
const moveToCadence = require('../cadence/moveToCadence');
const { pauseCadenceForLead } = require('../cadence/changeStatusForLead');
const createTasksForLeads = require('../task/createTasksForLeads');
const recalculateDailyTasksForUsers = require('../task/recalculateDailyTasksForUsers');
const applyOwnerChange = require('./triggers/applyOwnerChange');
const AccessTokenHelper = require('../access-token');
const CompanyFieldMapHelper = require('../company-field-map');
const SalesforceHelper = require('../salesforce');
const BullhornHelper = require('../bullhorn');

/**
 * @param {String} trigger - trigger that needs to be applied
 * @param {Sequelize.INTEGER} cadence_id - cadence for which trigger needs to be applied
 * @param {Sequelize.INTEGER} lead_id - lead for which trigger needs to be applied
 */
const applyWorkflow = async ({
  trigger,
  cadence_id = null,
  lead_id,
  extras = {},
}) => {
  let t;
  try {
    logger.info(`Applying workflow...`);

    let [lead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id },
      include: {
        [DB_TABLES.ACCOUNT]: {},
        [DB_TABLES.USER]: {
          attributes: ['company_id'],
          [DB_TABLES.COMPANY]: {
            attributes: ['integration_type', 'company_id'],
          },
        },
        [DB_TABLES.LEADTOCADENCE]: {
          attributes: ['status'],
          where: {
            cadence_id,
          },
          required: false,
        },
      },
    });
    if (errForLead) return [null, errForLead];
    if (!lead) return [null, `No lead found.`];
    if (!lead?.User?.company_id)
      return [null, `No company_id found for owner of the lead.`];

    const [workflow, errForWorkflow] = await fetchWorkflow({
      trigger,
      company_id: lead.User.company_id,
      cadence_id,
    });
    if (errForWorkflow) return [null, errForWorkflow];
    if (!workflow) {
      logger.info(`No workflow found.`);
      return [null, `No workflow found.`];
    }
    if (
      trigger === WORKFLOW_TRIGGERS.WHEN_CALL_DURATION_IS_GREATER_THAN &&
      extras.call_duration <= workflow.metadata?.trigger_call_duration
    )
      return [null, 'call duration threshold not reached'];

    if (
      [
        WORKFLOW_TRIGGERS.WHEN_A_LEAD_INTEGRATION_STATUS_IS_UPDATED,
        WORKFLOW_TRIGGERS.WHEN_A_ACCOUNT_INTEGRATION_STATUS_IS_UPDATED,
        WORKFLOW_TRIGGERS.WHEN_A_CONTACT_INTEGRATION_STATUS_IS_UPDATED,
      ].includes(trigger) &&
      !workflow.metadata?.trigger_lead_status.includes(extras.lead_status) &&
      !workflow.metadata?.trigger_lead_status.includes('any')
    )
      return [null, 'lead_status not a trigger status'];

    const actions = Object.keys(workflow?.actions || {});
    if (!actions?.length) return [`No actions set for trigger.`, null];

    // execute all actions
    for (let action of actions) {
      const data = workflow?.actions[action];
      switch (action) {
        case WORKFLOW_ACTIONS.CHANGE_OWNER:
          if (!data?.to) {
            logger.error(
              `'to' field having user_id of user to which ownership should be changed missing. `
            );
            break;
          }

          // change owner
          await changeOwner(lead, data.to);

          // calculate for both current and updated user
          recalculateDailyTasksForUsers([data.to, lead.user_id]);

          break;
        case WORKFLOW_ACTIONS.MOVE_TO_ANOTHER_CADENCE:
          if (!data.cadence_id) {
            logger.error(
              `Since cadence to which lead needs to be  moved not specified, not moving it.`
            );
            break;
          }

          const [moveData, _] = await moveToCadence(
            cadence_id, // from cadence id
            data.cadence_id, // to cadence id
            lead
          );

          if (moveData === `Moved,but creating task pending.`) {
            const [requiredNode, errForRequiredNode] =
              await Repository.fetchOne({
                tableName: DB_TABLES.NODE,
                query: {
                  cadence_id: data.cadence_id,
                  is_first: 1,
                },
              });
            if (errForRequiredNode) return [null, errForRequiredNode];

            await createTasksForLeads({
              leads: [lead],
              node: requiredNode,
              cadence_id: data.cadence_id,
              firstTask: true,
              dependencies: { applyWorkflow },
            });
          }

          recalculateDailyTasksForUsers([lead.user_id]);
          break;
        case WORKFLOW_ACTIONS.PAUSE_CADENCE:
          let pauseFor = null;
          if (data.unix_time)
            pauseFor = data.unix_time * 1000 + new Date().getTime();
          await pauseCadenceForLead(
            lead.lead_id,
            [cadence_id],
            pauseFor,
            extras?.message_id
          );

          recalculateDailyTasksForUsers([lead.user_id]);
          break;
        case WORKFLOW_ACTIONS.STOP_CADENCE:
          if (trigger === WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES) {
            await applyOwnerChange({
              action: WORKFLOW_ACTIONS.STOP_CADENCE,
              lead,
              data: {
                //salesforce_owner_id: extras?.salesforce_owner_id,
                crm: extras?.crm,
                integration_id: extras?.integration_id,
                new_user_id: extras?.new_user_id,
                oldOwnerSdId: extras?.oldOwnerSdId,
              },
            });
          } else if (trigger === WORKFLOW_TRIGGERS.WHEN_PEOPLE_REPLY_TO_EMAIL) {
            await stopCadenceForLead(lead, [cadence_id], extras?.message_id);
          } else {
            await stopCadenceForLead(lead, [cadence_id], extras?.message_id);
          }

          recalculateDailyTasksForUsers([
            lead.user_id,
            extras?.new_user_id || '',
          ]);

          break;
        case WORKFLOW_ACTIONS.CONTINUE_CADENCE:
          if (trigger === WORKFLOW_TRIGGERS.WHEN_A_OWNER_CHANGES) {
            await applyOwnerChange({
              action: WORKFLOW_ACTIONS.CONTINUE_CADENCE,
              lead,
              data: {
                //salesforce_owner_id: extras?.salesforce_owner_id,
                crm: extras?.crm,
                integration_id: extras?.integration_id,
                new_user_id: extras?.new_user_id,
                oldOwnerSdId: extras?.oldOwnerSdId,
              },
            });
          }

          recalculateDailyTasksForUsers([
            lead.user_id,
            extras?.new_user_id || '',
          ]);

          break;
        case WORKFLOW_ACTIONS.CHANGE_INTEGRATION_STATUS:
          //fetch access_token to update crm
          const [{ access_token, instance_url }, errForAccessToken] =
            await AccessTokenHelper.getAccessToken({
              user_id: lead.user_id, // sd admin
              integration_type: lead?.User?.Company?.integration_type,
            });

          if (!(access_token && instance_url)) {
            logger.error(`No access token or instance url found.`);
            return [
              null,
              `Please login with ${lead?.User?.Company?.integration_type}`,
            ];
          }

          //fetch field map to identify lead's converted and disqualified fields
          const [fieldMap, errFetchingFieldMap] =
            await CompanyFieldMapHelper.getFieldMapForCompanyFromUser({
              user_id: lead.user_id,
            });
          if (errFetchingFieldMap) {
            logger.error(`Unable to fetch field map`);
            return [null, `Could not fetch field map`];
          }

          let isCRMUpdated;
          let isLeadConverted = false,
            isLeadDisqualifed = false,
            isCustomWebhook = false,
            status = '',
            reason = '';

          switch (lead?.User?.Company?.integration_type) {
            case CRM_INTEGRATIONS.SALESFORCE:
              [isCRMUpdated, errUpdating] =
                await SalesforceHelper.updateLeadorContactStatus({
                  access_token,
                  instance_url,
                  lead,
                  fieldMap,
                  data,
                });
              break;
            case HIRING_INTEGRATIONS.BULLHORN:
              [isCRMUpdated, errUpdating] =
                await BullhornHelper.updateIntegrationStatus({
                  access_token,
                  instance_url,
                  lead,
                  fieldMap,
                  data,
                });
          }
          if (errUpdating) return [null, errUpdating];

          // check if the lead is disqualified or converted using respective integration feild map
          switch (lead.integration_type) {
            case LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD: {
              const { lead_map } = fieldMap;
              if (
                data?.lead_status ===
                lead_map?.integration_status?.disqualified?.value
              ) {
                isLeadDisqualifed = true;
                status = data?.lead_status;
                reason = data?.lead_reason;
              } else if (
                data?.lead_status ===
                lead_map?.integration_status?.converted?.value
              ) {
                isLeadConverted = true;
                status = data?.lead_status;
              } else if (
                data?.lead_status ===
                lead_map?.integration_status?.custom_actions?.value
              ) {
                isCustomWebhook = true;
                status = data?.lead_status;
                reason = data?.lead_reason;
              }
              break;
            }
            case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT: {
              const { contact_map, account_map, default_integration_status } =
                fieldMap;
              if (
                default_integration_status ===
                DEFAULT_INTEGRATION_STATUS.ACCOUNT
              ) {
                if (
                  data?.account_status ===
                  account_map?.integration_status?.disqualified?.value
                ) {
                  isLeadDisqualifed = true;
                  status = data?.account_status;
                  reason = data?.account_reason;
                } else if (
                  data?.account_status ===
                  account_map?.integration_status?.converted?.value
                ) {
                  isLeadConverted = true;
                  status = data?.account_status;
                } else if (
                  data?.account_status ===
                  account_map?.integration_status?.custom_actions?.value
                ) {
                  isCustomWebhook = true;
                  status = data?.account_status;
                  reason = data?.account_reason;
                }
              } else {
                if (
                  data?.contact_status ===
                  contact_map?.integration_status?.disqualified?.value
                ) {
                  isLeadDisqualifed = true;
                  status = data?.contact_status;
                  reason = data?.contact_reason;
                } else if (
                  data?.contact_status ===
                  contact_map?.integration_status?.converted?.value
                ) {
                  isLeadConverted = true;
                  status = data?.contact_status;
                } else if (
                  data?.contact_status ===
                  contact_map?.integration_status?.custom_actions?.value
                ) {
                  isCustomWebhook = true;
                  status = data?.contact_status;
                  reason = data?.contact_reason;
                }
              }
              break;
            }
            case LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE: {
              const { candidate_map } = fieldMap;
              if (
                data?.candidate_status ===
                candidate_map?.integration_status?.disqualified?.value
              ) {
                isLeadDisqualifed = true;
                status = data?.candidate_status;
                reason = data?.candidate_reason;
              } else if (
                data?.candidate_status ===
                candidate_map?.integration_status?.converted?.value
              ) {
                isLeadConverted = true;
                status = data?.candidate_status;
              } else if (
                data?.candidate_status ===
                candidate_map?.integration_status?.custom_actions?.value
              ) {
                isCustomWebhook = true;
                status = data?.candidate_status;
                reason = data?.candidate_reason;
              }
              break;
            }
            case LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT: {
              const { contact_map, account_map, default_integration_status } =
                fieldMap;
              if (
                default_integration_status.contact ===
                DEFAULT_INTEGRATION_STATUS.ACCOUNT
              ) {
                if (
                  data?.account_status ===
                  account_map?.integration_status?.disqualified?.value
                ) {
                  isLeadDisqualifed = true;
                  status = data?.account_status;
                  reason = data?.account_reason;
                } else if (
                  data?.account_status ===
                  account_map?.integration_status?.converted?.value
                ) {
                  isLeadConverted = true;
                  status = data?.account_status;
                } else if (
                  data?.account_status ===
                  account_map?.integration_status?.custom_actions?.value
                ) {
                  isCustomWebhook = true;
                  status = data?.account_status;
                  reason = data?.account_reason;
                }
              } else {
                if (
                  data?.contact_status ===
                  contact_map?.integration_status?.disqualified?.value
                ) {
                  isLeadDisqualifed = true;
                  status = data?.contact_status;
                  reason = data?.contact_reason;
                } else if (
                  data?.contact_status ===
                  contact_map?.integration_status?.converted?.value
                ) {
                  isLeadConverted = true;
                  status = data?.contact_status;
                } else if (
                  data?.contact_status ===
                  contact_map?.integration_status?.custom_actions?.value
                ) {
                  isCustomWebhook = true;
                  status = data?.contact_status;
                  reason = data?.contact_reason;
                }
              }
              break;
            }
            case LEAD_INTEGRATION_TYPES.BULLHORN_LEAD: {
              const { lead_map, account_map, default_integration_status } =
                fieldMap;
              if (
                default_integration_status.lead ===
                DEFAULT_BULLHORN_INTEGRATION_STATUS.ACCOUNT
              ) {
                if (
                  data?.account_status ===
                  account_map?.integration_status?.disqualified?.value
                ) {
                  isLeadDisqualifed = true;
                  status = data?.account_status;
                  reason = data?.account_reason;
                } else if (
                  data?.account_status ===
                  account_map?.integration_status?.converted?.value
                ) {
                  isLeadConverted = true;
                  status = data?.account_status;
                } else if (
                  data?.account_status ===
                  account_map?.integration_status?.custom_actions?.value
                ) {
                  isCustomWebhook = true;
                  status = data?.account_status;
                  reason = data?.account_reason;
                }
              } else {
                if (
                  data?.lead_status ===
                  lead_map?.integration_status?.disqualified?.value
                ) {
                  isLeadDisqualifed = true;
                  status = data?.lead_status;
                  reason = data?.lead_reason;
                } else if (
                  data?.lead_status ===
                  lead_map?.integration_status?.converted?.value
                ) {
                  isLeadConverted = true;
                  status = data?.lead_status;
                } else if (
                  data?.lead_status ===
                  lead_map?.integration_status?.custom_actions?.value
                ) {
                  isCustomWebhook = true;
                  status = data?.lead_status;
                  reason = data?.lead_reason;
                }
              }
              break;
            }
          }

          // if status change is CRM successful call webhooks
          if (isCRMUpdated) {
            let [webhooks, errFetchingWebhooks] = await Repository.fetchAll({
              tableName: DB_TABLES.WEBHOOK,
              query: {
                webhook_type: {
                  [Op.or]: [
                    WEBHOOK_TYPE.CONVERT,
                    WEBHOOK_TYPE.DISQUALIFY,
                    WEBHOOK_TYPE.CUSTOM,
                  ],
                },
              },
              include: {
                [DB_TABLES.COMPANY_SETTINGS]: {
                  [DB_TABLES.COMPANY]: {
                    where: {
                      company_id: lead?.User?.Company?.company_id,
                    },
                    required: true,
                    attributes: ['company_id'],
                  },
                  attributes: ['company_settings_id'],
                  required: true,
                },
              },
            });
            if (errFetchingWebhooks) return [null, errFetchingWebhooks];

            let convertWebhooks = [];
            let disqualifyWebhooks = [];
            let customWebhooks = [];
            webhooks.forEach((webhook) => {
              if (webhook.webhook_type === WEBHOOK_TYPE.CONVERT)
                convertWebhooks.push(webhook);
              if (webhook.webhook_type === WEBHOOK_TYPE.DISQUALIFY)
                disqualifyWebhooks.push(webhook);
              if (webhook.webhook_type === WEBHOOK_TYPE.CUSTOM)
                customWebhooks.push(webhook);
            });

            if (isLeadConverted && convertWebhooks.length)
              //invoke convert Webhook
              convertWebhooks.forEach((convertWebhook) =>
                axios({
                  method: convertWebhook.http_method,
                  url: convertWebhook.url,
                  headers: {
                    Authorization: `Bearer ${convertWebhook.auth_token}`,
                    'Content-Type': 'application/json',
                  },
                  data: JSON.stringify({
                    type: lead.integration_type,
                    Id: lead.integration_id,
                    status: status,
                  }),
                })
              );
            else if (isLeadDisqualifed && disqualifyWebhooks.length)
              // invoke disqualified webhook
              disqualifyWebhooks.forEach((disqualifyWebhook) =>
                axios({
                  method: disqualifyWebhook.http_method,
                  url: disqualifyWebhook.url,
                  headers: {
                    Authorization: `Bearer ${disqualifyWebhook.auth_token}`,
                    'Content-Type': 'application/json',
                  },
                  data: JSON.stringify({
                    type: lead.integration_type,
                    Id: lead.integration_id,
                    status,
                    reason,
                  }),
                })
              );
            else if (customWebhooks.length && isCustomWebhook) {
              customWebhooks.forEach((customWebhook) =>
                axios({
                  method: customWebhook.http_method,
                  url: customWebhook.url,
                  headers: {
                    Authorization: `Bearer ${customWebhook.auth_token}`,
                    'Content-Type': 'application/json',
                  },
                  data: JSON.stringify({
                    type: customWebhook.object_type,
                    Id: lead.integration_id,
                    AccountId: lead.Account.integration_id,
                    status,
                    reason,
                  }),
                  data: JSON.stringify({
                    type: lead.integration_type,
                    Id: lead.integration_id,
                    status,
                    reason,
                  }),
                })
              );
            }
          }
          break;
        case WORKFLOW_ACTIONS.GO_TO_LAST_STEP_OF_CADENCE:
          t = await sequelize.transaction();
          if (!lead_id || !cadence_id) {
            t.rollback();
            logger.error(
              'cannot apply workflow without lead_id and cadence_id'
            );
            return [null, 'lead_id and cadence_id required'];
          }

          //recursively fetch node after current node
          const [nextNodes, errNextNodes] = await Repository.runRawQuery({
            tableName: DB_MODELS[DB_TABLES.NODE],
            rawQuery: `WITH RECURSIVE nextNodes AS (
              SELECT n.* FROM node n INNER JOIN task t ON t.node_id = n.node_id
              WHERE t.lead_id = :lead_id and t.cadence_id = :cadence_id and t.completed = false and t.is_skipped = false
              and n.node_id NOT IN (${Object.values(CUSTOM_TASK_NODE_ID).join(
                ','
              )}) 
              UNION ALL
              SELECT n.* FROM node n 
              INNER JOIN
              nextNodes c ON n.node_id = c.next_node_id 
              WHERE n.node_id NOT IN (${Object.values(CUSTOM_TASK_NODE_ID).join(
                ','
              )}))
             SELECT * FROM nextNodes;`,
            replacements: {
              lead_id,
              cadence_id,
            },
            include: [{ model: DB_MODELS[DB_TABLES.TASK] }],
            t,
          });
          if (errNextNodes) {
            t.rollback();
            logger.error(`Error fetching next nodes: ${errNextNodes}`);
            reutrn[(null, errNextNodes)];
          }
          if (nextNodes.length <= 1) {
            t.rollback();
            logger.error('No next nodes found!');
            return [null, 'No next nodes found!'];
          }
          //remove current node as it is already skipped
          const currentNode = nextNodes.shift();
          const lastNode = nextNodes.pop();

          // skip current task
          const [currentTask, errCurrentTask] = await Repository.update({
            tableName: DB_TABLES.TASK,
            updateObject: {
              is_skipped: true,
              skip_reason: 'Go to last step of cadence workflow applied',
              status: TASK_STATUSES.SKIPPED,
            },
            query: {
              lead_id,
              cadence_id,
              node_id: currentNode.dataValues.node_id,
            },
          });
          if (errCurrentTask) {
            t.rollback();
            logger.error(`Error skipping current task: ${errCurrentTask}`);
            return [null, errCurrentTask];
          }

          //bulk create intermidiate skipped task
          const createTaskObjs = [];
          for (let node of nextNodes) {
            createTaskObjs.push({
              name: TASK_NAMES_BY_TYPE[node.dataValues.type],
              lead_id,
              cadence_id,
              is_skipped: true,
              start_time: new Date().getTime(),
              skip_time: new Date().getTime(),
              status: TASK_STATUSES.SKIPPED,
              urgent_time: 0,
              user_id: lead.user_id,
              node_id: node.dataValues.node_id,
              skip_reason: 'Go to last step of cadence workflow applied',
            });
          }

          const [skippedTasks, errForTasks] = await Repository.bulkCreate({
            tableName: DB_TABLES.TASK,
            createObject: createTaskObjs,
            t,
          });
          if (errForTasks) {
            t.rollback();
            logger.error(`Error while creating skip task: ${errForTasks}`);
            return [null, errForTasks];
          }
          t.commit();
          if (
            lead.LeadToCadences[0]?.status === CADENCE_LEAD_STATUS.IN_PROGRESS
          ) {
            await createTasksForLeads({
              leads: [lead],
              node: lastNode.dataValues,
              cadence_id,
              firstTask: false,
              dependencies: { applyWorkflow },
            });
            recalculateDailyTasksForUsers([lead.user_id]);
          }
          break;
      }
    }

    logger.info(`Executed all actions.`);
    return [`Executed all actions.`, null];
  } catch (err) {
    if (t) t.rollback();
    logger.error(`Error while applying workflow: `, err);
    return [null, err.message];
  }
};

//(async function test() {
//const [lead, _] = await Repository.fetchOne({
//tableName: DB_TABLES.LEAD,
//query: { lead_id: 1 },
//});
//console.log(
//await applyWorkflow({
//trigger: 'when_a_cadence_is_paused',
//cadence_id: 1,
//company_id: '4192bff0-e1e0-43ce-a4db-912808c32493',
//lead,
//sendActivity: () => console.log(`dummy`),
//})
//);
//})();

module.exports = applyWorkflow;

// applyWorkflow({
//   trigger: 'when_a_lead_integration_status_is_updated',
//   cadence_id: 1,
//   lead_id: 5,
//   extras: {
//     lead_status: 'converted',
//   },
// });
