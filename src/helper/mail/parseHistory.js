// Utils
const logger = require('../../utils/winston');
const {
  LEAD_STATUS,
  CADENCE_LEAD_STATUS,
  EMAIL_STATUS,
  NODE_TYPES,
  SETTING_TYPES,
  ACTIVITY_TYPE,
  WORKFLOW_TRIGGERS,
  NOTIFICATION_TYPES,
  CRM_INTEGRATIONS,
  LEAD_SCORE_RUBRIKS,
  HIRING_INTEGRATIONS,
  TASK_STATUSES,
} = require('../../utils/enums');

// Packages
const parseGmailMessage = require('gmail-api-parse-message');
const parser = require('node-html-parser');

// Repositories
const { sequelize } = require('../../db/models');
const Repository = require('../../repository');
const EmailRepository = require('../../repository/email.repository');

// Helpers and services
const Mail = require('../../services/Google/Mail');
const ActivityHelper = require('../activity');
const createTasksForLeads = require('../task/createTasksForLeads');
const recalculateDailyTasksForUsers = require('../task/recalculateDailyTasksForUsers');
const getSettingsForUser = require('../user/getSettingsForUser');
const WorkflowHelper = require('../workflow');
const { DB_TABLES } = require('../../utils/modelEnums');
const SocketHelper = require('../socket');
const NotificationHelper = require('../notification');
const processVacationResponses = require('./processVacationResponses');
const AccessTokenHelper = require('../access-token');
const abTestingHelper = require('../abTesting');
const LeadScoreHelper = require('../lead-score/');

const getEmail = (fromHeader) => {
  if (fromHeader) fromHeader = fromHeader.toLowerCase();
  const rfc2822EmailRegex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  const result = fromHeader.match(rfc2822EmailRegex);
  if (result) return result[0];
  return null;
};

const parseMessagesUpdated = async (user, messagesUpdated) => {
  try {
    const { user_id } = user;

    const [userToken, errForUserToken] = await Repository.fetchOne({
      tableName: DB_TABLES.USER_TOKEN,
      query: { user_id },
      include: {
        [DB_TABLES.USER]: {
          attributes: ['user_id'],
          [DB_TABLES.COMPANY]: {
            attributes: ['company_id', 'integration_type'],
            [DB_TABLES.COMPANY_SETTINGS]: {
              attributes: ['activity_to_log', 'custom_activity_type'],
            },
          },
        },
      },
    });
    if (errForUserToken) throw new Error(errForUserToken);

    const companySetting = userToken?.User?.Company?.Company_Setting;
    const integrationType = userToken?.User?.Company?.integration_type;

    let access_token, instance_url, errForAccessToken;
    if (
      companySetting?.activity_to_log?.MAIL?.enabled &&
      [
        CRM_INTEGRATIONS.SALESFORCE,
        CRM_INTEGRATIONS.PIPEDRIVE,
        CRM_INTEGRATIONS.ZOHO,
        CRM_INTEGRATIONS.HUBSPOT,
        HIRING_INTEGRATIONS.BULLHORN,
        CRM_INTEGRATIONS.SELLSY,
        CRM_INTEGRATIONS.DYNAMICS,
      ].includes(integrationType)
    ) {
      [{ access_token, instance_url }, errForAccessToken] =
        await AccessTokenHelper.getAccessToken({
          integration_type: integrationType,
          user_id: user.user_id,
        });
      if (access_token === null || errForAccessToken) {
        logger.error(
          `Error while fetching access token or instance url: ${errForAccessToken}`
        );
      }
    }

    for (const { id } of messagesUpdated) {
      if (!id) continue;
      const [mail] = await Mail.Inbox.getByMessageId({
        token: { refresh_token: userToken.google_refresh_token },
        message_id: id,
      });

      if (!mail) continue;

      // Don't process if draft
      if (mail.draft) {
        logger.info(`Draft found`);
        continue;
      }

      let lead_to_cadence_id, cadence_id, node_id, et_id, lead_id;
      let lead;

      if (!mail.sent) {
        if (mail.from.address === 'mailer-daemon@googlemail.com') {
          let toTriggerCadenceEnd = false;
          logger.info(`Bounce mail found`);

          // try {
          //   node_id = parser
          //     .parse(mail.textHtml)
          //     .querySelector('#lead_to_cadence')
          //     .getAttribute('data-node_id');
          //   if (isNaN(node_id)) node_id = null;
          // } catch (e) {
          //   logger.error(`Error while parsing message: `, e);
          //   node_id = null;
          // }

          const [oldEmail, errOldEmail] = await Repository.fetchOne({
            tableName: DB_TABLES.EMAIL,
            query: { thread_id: mail.thread_id },
          });
          if (errOldEmail || !oldEmail) {
            logger.info(`No thread found for the mail`);
            continue;
          }

          node_id = oldEmail.node_id;
          cadence_id = oldEmail.cadence_id;

          // ==== MAIL BOUNCED ====

          const [email, errEmailUpdate] = await Repository.update({
            tableName: DB_TABLES.EMAIL,
            query: {
              thread_id: mail.thread_id,
            },
            updateObject: {
              status: 'bounced',
              tracking_status_update_timestamp: new Date(),
            },
          });
          if (errEmailUpdate) {
            logger.error(
              `\nError while updating email status: ${errEmailUpdate}\n`
            );
            continue;
          }

          console.log('\nEmail updated:\n', email);

          // Extract lead_cadence_id from mail body
          // We need this to fetch the lead_id
          // If failed, lead is fetched by recepient email_id
          try {
            lead_to_cadence_id = parser
              .parse(mail.textHtml)
              .querySelector('#lead_to_cadence')
              .getAttribute('data-lead_to_cadence_id');
          } catch (err) {
            lead_to_cadence_id = null;
            logger.error(
              'Failed to extract lead_cadence_id from textHtml',
              err
            );
          }

          try {
            lead_id = parser
              .parse(mail.textHtml)
              .querySelector('#lead_to_cadence')
              .getAttribute('data-lead_id');
            if (isNaN(lead_id)) lead_id = null;
          } catch (err) {
            lead_id = null;
            logger.error('Failed to extract lead_id from textHtml', err);
          }

          if (lead_to_cadence_id && lead_to_cadence_id !== 'null') {
            logger.info(`lead_to_cadence_id: ${lead_to_cadence_id}`);

            const [leadToCadence, errLeadToCadence] = await Repository.fetchOne(
              {
                table: DB_TABLES.LEADTOCADENCE,
                query: {
                  lead_cadence_id: lead_to_cadence_id,
                },
                include: {
                  [DB_TABLES.LEAD]: {
                    [DB_TABLES.USER]: {},
                  },
                },
              }
            );
            if (errLeadToCadence)
              logger.error(
                'Error while fetching lead-to-cadence in parseHistory: ',
                errLeadToCadence
              );

            lead = leadToCadence?.Leads?.[0];
            logger.info('Fetched lead by lead_cadence_id');
          } else if (lead_id && lead_id !== 'null') {
            const [fetchedLead, errFetchedLead] = await Repository.fetchOne({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id,
              },
            });
            if (errFetchedLead) {
              logger.error(errFetchedLead);
            }
            lead = fetchedLead;
            logger.info('Fetched lead by lead_id');
          }

          if (!lead) {
            // Fetch lead email that belongs to the user
            const [leadEmail, errWhileFetchingLeadEmail] =
              await Repository.fetchOne({
                tableName: DB_TABLES.LEAD_EMAIL,
                query: sequelize.where(
                  sequelize.fn('lower', sequelize.col('email_id')),
                  sequelize.fn(
                    'lower',
                    getEmail(
                      mail.failedRecipients //TODO XFAILEDPARTICIPANTS
                    )
                  )
                ),
                include: {
                  [DB_TABLES.LEAD]: {
                    where: {
                      user_id,
                    },
                    [DB_TABLES.USER]: {
                      attributes: [],
                      where: {
                        company_id: user.company_id,
                      },
                      required: true,
                    },
                    required: true,
                  },
                },
              });
            if (errWhileFetchingLeadEmail)
              logger.error(
                'Error while fetching lead email',
                errWhileFetchingLeadEmail
              );

            lead = leadEmail?.Lead;
          }

          if (!lead) {
            logger.info('No lead found for this email');
            continue;
          }

          const [bouncedEmail, errWhileFetchingBouncedEmail] =
            await Repository.fetchOne({
              tableName: DB_TABLES.EMAIL,
              query: {
                sent: true,
                thread_id: mail.thread_id,
              },
            });
          if (errWhileFetchingBouncedEmail) {
            logger.error(
              `Error while fetching bounced email: `,
              errWhileFetchingBouncedEmail
            );
            continue;
          }

          //This email is not related to CRM

          const [activityFromTemplate, errForActivityFromTemplate] =
            ActivityHelper.getActivityFromTemplates({
              type: ACTIVITY_TYPE.BOUNCED_MAIL,
              variables: {
                lead_first_name: lead.first_name,
                lead_last_name: lead.last_name,
              },
              activity: {
                lead_id: lead.lead_id,
                incoming: null,
                cadence_id: cadence_id,
                node_id: node_id,
                message_id: bouncedEmail.message_id,
              },
            });

          // Creating activity
          const [createdActivity, errForActivity] =
            await ActivityHelper.activityCreation(
              activityFromTemplate,
              lead.user_id
            );
          if (errForActivity) {
            logger.error(
              `Error creating activity for bounced: `,
              errForActivity
            );
          }
          if (createdActivity && !errForActivity) {
            const [notificationFromTemplate, errForNotificationFromTemplate] =
              NotificationHelper.getNotificationFromTemplate({
                type: NOTIFICATION_TYPES.BOUNCED,
                notification: {
                  user_id: user_id,
                  lead_id: lead.lead_id,
                  lead_first_name: lead.first_name,
                  lead_last_name: lead.last_name,
                  message_id: bouncedEmail.message_id,
                },
              });

            // * Send socket event for bounced mail
            SocketHelper.sendNotification(notificationFromTemplate);

            // Score the lead
            const [leadScore, errForLeadScore] =
              await LeadScoreHelper.updateLeadScore({
                lead,
                rubrik: LEAD_SCORE_RUBRIKS.BOUNCED_MAIL,
                activity_id: createdActivity?.activity_id,
              });
          }

          // * Fetch all cadences of lead, where "remove_if_bounce" is true
          let [links, errForLinks] = await Repository.fetchAll({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: lead.lead_id,
            },
            include: {
              [DB_TABLES.CADENCE]: {
                where: {
                  remove_if_bounce: true,
                },
              },
            },
          });
          if (errForLinks) {
            logger.error(`Error while fetching links for lead: `, errForLinks);
            continue;
          }

          let linksToStop = [];

          let cadencesToStop = [];

          for (let link of links) {
            linksToStop.push(link.lead_cadence_id);
            cadencesToStop.push(link?.Cadences?.[0]);
          }

          const [updateLeadToCadence, errForLeadToCadenceUpdate] =
            await Repository.update({
              tableName: DB_TABLES.LEADTOCADENCE,
              query: {
                lead_cadence_id: linksToStop,
              },
              updateObject: {
                status: CADENCE_LEAD_STATUS.STOPPED,
              },
            });
          if (errForLeadToCadenceUpdate) {
            logger.error(
              'Error while updating lead to cadence status:',
              errForLeadToCadenceUpdate
            );
            continue;
          }

          for (let cadence of cadencesToStop) {
            if (cadence?.name) {
              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.STOP_CADENCE,
                  variables: {
                    cadence_name: cadence.name,
                    first_name: user?.first_name || null,
                    last_name: user?.last_name || null,
                  },
                  activity: {
                    lead_id: lead.lead_id,
                    incoming: null,
                    node_id,
                  },
                });

              ActivityHelper.activityCreation(activityFromTemplate, user_id);
            }
          }

          // * Get all cadences of lead, where "remove_if_bounce" is false

          let [linksToSkip, errForLinksToSkip] = await Repository.fetchAll({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: lead.lead_id,
            },
            include: {
              [DB_TABLES.CADENCE]: {
                where: {
                  // remove_if_bounce: false,
                },
              },
            },
          });
          if (errForLinksToSkip) {
            linksToSkip = [];

            logger.error(
              'Error while fetching links to skip',
              errForLinksToSkip
            );
            continue;
          }

          for (let link of linksToSkip) {
            // * Update lead to cadence link bounced status

            const [updateLeadToCadence, errForLeadToCadenceUpdate] =
              await Repository.update({
                tableName: DB_TABLES.LEADTOCADENCE,
                query: {
                  lead_cadence_id: link.lead_cadence_id,
                },
                updateObject: {
                  is_bounced: 1,
                },
              });
            if (errForLeadToCadenceUpdate) {
              logger.error(
                'Error while updating lead to cadence status:',
                errForLeadToCadenceUpdate
              );
              continue;
            }

            let [tasks, errFetchingTasks] = await Repository.fetchAll({
              tableName: DB_TABLES.TASK,
              query: {
                lead_id: link.lead_id,
                completed: 0,
                is_skipped: 0,
                cadence_id: bouncedEmail.cadence_id,
              },
              include: {
                [DB_TABLES.NODE]: {},
                [DB_TABLES.CADENCE]: {},
              },
            });
            if (errFetchingTasks) {
              logger.error('Error while fetching tasks', errFetchingTasks);
              continue;
            }

            const [settings, errForSettings] = await getSettingsForUser({
              user_id: lead.user_id,
              setting_type: SETTING_TYPES.BOUNCED_MAIL_SETTINGS,
            });

            if (errForSettings) {
              logger.error('Error while fetching settings', errForSettings);
              continue;
            }

            let bounced_settings;

            const [currentNode, _] = await Repository.fetchOne({
              tableName: DB_TABLES.NODE,
              query: {
                node_id,
              },
            });

            if (currentNode) {
              if (
                currentNode.type == NODE_TYPES.AUTOMATED_MAIL ||
                currentNode.type == NODE_TYPES.AUTOMATED_REPLY_TO
              )
                bounced_settings =
                  settings?.Bounced_Mail_Setting?.automatic_bounced_data;
              else
                bounced_settings =
                  settings?.Bounced_Mail_Setting?.semi_automatic_bounced_data;
            } else bounced_settings = null;

            if (
              bounced_settings != undefined &&
              bounced_settings[tasks[0]?.Node.type]
            ) {
              const [updateSkipTask, errForUpdateSkipTask] =
                await Repository.update({
                  tableName: DB_TABLES.TASK,
                  query: {
                    task_id: tasks[0].task_id,
                  },
                  updateObject: {
                    is_skipped: true,
                    skip_time: new Date().getTime(),
                    status: TASK_STATUSES.SKIPPED,
                  },
                });
              if (errForUpdateSkipTask) {
                logger.error(
                  'Error while updating skip task',
                  errForUpdateSkipTask
                );
                continue;
              }

              // Create new tasks for skipped task
              const [nextNode, errForNextNode] = await Repository.fetchOne({
                tableName: DB_TABLES.NODE,
                query: {
                  node_id: tasks[0].Node.next_node_id,
                },
              });
              if (errForNextNode) {
                logger.error('Error while fetching next node', errForNextNode);
                continue;
              }

              if (nextNode)
                await createTasksForLeads({
                  leads: [lead],
                  node: nextNode,
                  cadence_id: tasks[0].Cadence.cadence_id,
                  firstTask: false,
                });
              else {
                const [activityFromTemplate, errForActivityFromTemplate] =
                  ActivityHelper.getActivityFromTemplates({
                    type: ACTIVITY_TYPE.COMPLETED_CADENCE,
                    variables: {
                      cadence_name: tasks[0]?.Cadence?.name,
                    },
                    activity: {
                      lead_id: lead.lead_id,
                      incoming: null,
                      node_id,
                    },
                  });

                ActivityHelper.activityCreation(activityFromTemplate, user_id);
                toTriggerCadenceEnd = true;
              }
              recalculateDailyTasksForUsers([user_id]);
            }
          }

          const [node, errForNode] = await Repository.fetchOne({
            tableName: DB_TABLES.NODE,
            query: {
              node_id: node_id,
            },
          });
          if (errForNode) {
            logger.error('Error while fetching node', errForNode);
            continue;
          }

          WorkflowHelper.applyWorkflow({
            trigger: WORKFLOW_TRIGGERS.WHEN_AN_EMAIL_BOUNCES,
            cadence_id: node?.cadence_id,
            lead_id: lead.lead_id,
            extras: {
              message_id: id,
            },
          });

          if (toTriggerCadenceEnd)
            WorkflowHelper.applyWorkflow({
              trigger: WORKFLOW_TRIGGERS.WHEN_A_CADENCE_ENDS,
              lead_id: lead.lead_id,
              cadence_id: node?.cadence_id,
              extras: {
                message_id: id,
              },
            });
        } else if (mail.received) {
          // Fetching lead by query
          let email,
            errEmail,
            isVacationResponse = false,
            isReplied = false;

          // Fetching user by query
          const [user, userErr] = await Repository.fetchOne({
            tableName: DB_TABLES.USER,
            query: {
              user_id: user_id,
            },
          });
          if (userErr) {
            logger.error('Error while fetching user', userErr);
            continue;
          }

          logger.info('MESSAGE FOUND IN RECEIVED FOLDER');
          logger.info(`FINDING LEAD: ${mail.from.address}`);

          try {
            lead_to_cadence_id = parser
              .parse(mail.textHtml)
              .querySelector('#lead_to_cadence')
              .getAttribute('data-lead_to_cadence_id');
          } catch (err) {
            lead_to_cadence_id = null;
            logger.error(
              'Failed to extract lead_cadence_id from textHtml',
              err
            );
          }

          try {
            lead_id = parser
              .parse(mail.textHtml)
              .querySelector('#lead_to_cadence')
              .getAttribute('data-lead_id');
            if (isNaN(lead_id)) lead_id = null;
          } catch (err) {
            lead_id = null;
            logger.error('Failed to extract lead_id from textHtml', err);
          }

          let leadEmail, errLeadEmail;

          if (lead_to_cadence_id && lead_to_cadence_id !== 'null') {
            const [leadToCadence, errLeadToCadence] = await Repository.fetchOne(
              {
                table: DB_TABLES.LEADTOCADENCE,
                query: {
                  lead_cadence_id: lead_to_cadence_id,
                },
                include: {
                  [DB_TABLES.LEAD_EMAIL]: {
                    where: sequelize.where(
                      sequelize.fn('lower', sequelize.col('email_id')),
                      sequelize.fn('lower', getEmail(mail.from.address))
                    ),
                  },
                  [DB_TABLES.LEAD]: {
                    [DB_TABLES.USER]: {},
                  },
                },
              }
            );
            if (errLeadToCadence)
              logger.error(
                'Error while fetching lead-to-cadence in parseHistory: ',
                errLeadToCadence
              );

            lead = leadToCadence?.Leads?.[0];
            leadEmail = lead?.Lead_emails?.[0];
            logger.info('Fetched lead by lead_cadence_id');
          } else if (lead_id && lead_id !== 'null') {
            const [fetchedLead, errFetchedLead] = await Repository.fetchOne({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id,
              },
              include: {
                [DB_TABLES.LEAD_EMAIL]: {
                  where: sequelize.where(
                    sequelize.fn('lower', sequelize.col('email_id')),
                    sequelize.fn('lower', getEmail(mail.from.address))
                  ),
                },
              },
            });
            if (errFetchedLead) {
              logger.error(errFetchedLead);
            }
            lead = fetchedLead;
            leadEmail = lead?.Lead_emails[0];
            logger.info('Fetched lead by lead_id');
          }

          // Check for replied received mail
          let threadId = mail.thread_id ?? null;

          if (threadId) {
            const [emails, errEmails] = await Repository.fetchAll({
              tableName: DB_TABLES.EMAIL,
              query: {
                sent: true,
                thread_id: threadId,
              },
              include: {
                [DB_TABLES.LEAD]: {
                  where: {
                    user_id: user_id,
                  },
                  [DB_TABLES.USER]: {
                    attributes: [],
                    where: {
                      company_id: user.company_id,
                    },
                    required: true,
                  },
                  [DB_TABLES.LEAD_EMAIL]: {
                    where: sequelize.where(
                      sequelize.fn('lower', sequelize.col('email_id')),
                      sequelize.fn('lower', getEmail(mail.from.address))
                    ),
                  },
                  required: true,
                },
              },
              extras: {
                order: [['created_at', 'DESC']],
                limit: 1,
              },
            });
            if (errEmails) {
              logger.error(
                '\nError while getting email by threadId:\n',
                errEmails
              );
              continue;
            }

            email = emails[0];
            lead = email?.Lead;
            leadEmail = lead?.Lead_emails?.[0];

            if (email) {
              cadence_id = email.cadence_id ?? null;
              node_id = email.node_id ?? null;
              et_id = email?.et_id;

              if (leadEmail) {
                // mail.from.address should not match user email address
                if (
                  ![user.primary_email, user.email].includes(
                    mail.from.address?.toLowerCase()
                  )
                )
                  isReplied = true;
              } else {
                logger.info('LEAD EMAIL NOT FOUND.');
              }
            } else {
              cadence_id = null;
              node_id = null;
              et_id = null;
            }
          }

          if (!lead || !leadEmail) {
            const [leadEmails, errLeadEmails] = await Repository.fetchAll({
              tableName: DB_TABLES.LEAD_EMAIL,
              query: sequelize.where(
                sequelize.fn('lower', sequelize.col('email_id')),
                sequelize.fn('lower', getEmail(mail.from.address))
              ),
              include: {
                [DB_TABLES.LEAD]: {
                  where: {
                    user_id: user_id,
                  },
                  [DB_TABLES.USER]: {
                    attributes: [],
                    where: {
                      company_id: user.company_id,
                    },
                    required: true,
                  },
                  required: true,
                },
              },
              extras: {
                group: ['lead_id'],
              },
            });
            if (errLeadEmails) {
              logger.error(errLeadEmails);
            }

            if (leadEmails?.length === 1) {
              lead = leadEmails?.[0]?.Lead;
              logger.info(`Fetched lead by email_id`);
            } else {
              if (leadEmails)
                logger.info(
                  `Multiple leads found having email id: ${mail.from.address}`
                );
              else
                logger.info(
                  `No leads found having email id: ${mail.from.address}`
                );
            }
          }

          if (!lead) {
            // logger.info(`Mail not related to CRM`);
            logger.info('No lead found for this email');
            continue;
          }

          //This email is not related to CRM

          //VACATION RESPONSE
          // const [vacationResponse, errForVacationResponse] =
          //   await processVacationResponses({
          //     lead,
          //     parsedMessage,
          //     userToken,
          //   });

          // if (vacationResponse?.toLowerCase()?.includes('success'))
          //   isVacationResponse = true;
          // if (errForVacationResponse)
          //   logger.error(
          //     'Error occured for vacation response',
          //     errForVacationResponse
          //   );
          //

          if (isReplied && !isVacationResponse)
            WorkflowHelper.applyWorkflow({
              trigger: WORKFLOW_TRIGGERS.WHEN_PEOPLE_REPLY_TO_EMAIL,
              cadence_id: email.cadence_id,
              lead_id: lead.lead_id,
              extras: {
                message_id: id,
              },
            });

          // * Fetch all cadences of lead, where "remove_if_bounce" is true
          let [links, errForLinks] = await Repository.fetchAll({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_id: lead.lead_id,
            },
            include: {
              [DB_TABLES.CADENCE]: {
                where: {
                  remove_if_reply: true,
                },
              },
            },
          });

          if (errForLinks) {
            logger.error('Error while fetching links', errForLinks);
            continue;
          }

          let linksToStop = [],
            cadencesToStop = [];

          for (let link of links) {
            linksToStop.push(link.lead_cadence_id);
            cadencesToStop.push(link?.Cadences?.[0]);
          }

          const [updateLeadToCadence, errForLeadToCadenceUpdate] =
            await Repository.update({
              tableName: DB_TABLES.LEADTOCADENCE,
              query: {
                lead_cadence_id: linksToStop,
              },
              updateObject: {
                status: CADENCE_LEAD_STATUS.STOPPED,
              },
            });
          if (errForLeadToCadenceUpdate) {
            logger.error(
              '\nError while updating lead to cadence:\n',
              errForLeadToCadenceUpdate
            );
            continue;
          }

          // TODO: create activity for cadence stopped
          for (let cadence of cadencesToStop) {
            if (cadence.name) {
              const [activityFromTemplate, errForActivityFromTemplate] =
                ActivityHelper.getActivityFromTemplates({
                  type: ACTIVITY_TYPE.STOP_CADENCE,
                  variables: {
                    cadence_name: cadence.name,
                    first_name: user?.first_name || null,
                    last_name: user?.last_name || null,
                  },
                  activity: {
                    lead_id: lead.lead_id,
                    incoming: null,
                    node_id,
                  },
                });

              ActivityHelper.activityCreation(activityFromTemplate, user_id);
            }
          }

          const [success, e] = await EmailRepository.upsert(
            user_id,
            lead.lead_id,
            mail,
            cadence_id,
            node_id,
            et_id,
            false
          );
          if (e) logger.error(`Error while upserting mail: `, e);
          if (isVacationResponse) continue;
          let createdActivity, errForActivity;
          if (isReplied) {
            [createdActivity, errForActivity] =
              await ActivityHelper.createAndSendReplyActivity({
                user,
                lead,
                mail,
                incoming: true,
                cadence_id: cadence_id,
                node_id: node_id,
                access_token,
                instance_url,
                integration_type: integrationType,
                company_setting: companySetting,
              });

            if (!errForActivity) {
              // Score the lead for replied emails
              let [leadScore, errForLeadScore] =
                await LeadScoreHelper.updateLeadScore({
                  lead,
                  rubrik: LEAD_SCORE_RUBRIKS.EMAIL_REPLIED,
                  activity_id: createdActivity?.activity_id,
                });
              if (errForLeadScore)
                logger.error(
                  'An error occured while scoring lead for reply: ',
                  errForLeadScore
                );
            }

            // create row for ab testing for reply received
            if (node_id) {
              const [abTestingEntry, errForAbTesting] =
                await abTestingHelper.addEntryForReply(node_id, mail);
              if (errForAbTesting)
                logger.error(
                  `Error while creating ab testing entry using helper: `,
                  errForAbTesting
                );
            }
          } else {
            [createdActivity, errForActivity] =
              await ActivityHelper.createAndSendMailActivity({
                user,
                lead,
                mail,
                sent: false,
                cadence_id,
                node_id,
                access_token,
                instance_url,
                integration_type: integrationType,
                company_setting: companySetting,
              });
          }
          if (errForActivity)
            logger.error(`Error while creating activity: ${errForActivity}`);

          // ==== IF THE INCOMING MAIL IS THE FIRST INTERACTION BETWEEN SALESPERSON AND LEAD, MOVE TO ONGOING ====
          if (lead.status === LEAD_STATUS.NEW_LEAD) {
            const [updatedLead, errForLeadUpdate] = await Repository.update({
              tableName: DB_TABLES.LEAD,
              query: {
                lead_id: lead.lead_id,
              },
              updateObject: {
                status: LEAD_STATUS.ONGOING,
              },
            });
            if (errForLeadUpdate) {
              logger.error(errForLeadUpdate);
              continue;
            }
          }
        }
      } else if (mail.sent) {
        try {
          lead_to_cadence_id = parser
            .parse(mail.textHtml)
            .querySelector('#lead_to_cadence')
            .getAttribute('data-lead_to_cadence_id');
        } catch (e) {
          lead_to_cadence_id = null;
          logger.error(e.message);
        }

        try {
          node_id = parser
            .parse(mail.textHtml)
            .querySelector('#lead_to_cadence')
            .getAttribute('data-node_id');
          if (isNaN(node_id)) node_id = null;
        } catch (e) {
          node_id = null;
          logger.error(e.message);
        }

        try {
          lead_id = parser
            .parse(mail.textHtml)
            .querySelector('#lead_to_cadence')
            .getAttribute('data-lead_id');
          if (isNaN(lead_id)) lead_id = null;
        } catch (err) {
          lead_id = null;
          logger.error('Failed to extract lead_id from textHtml', err);
        }

        logger.info('MESSAGE FOUND IN SENT FOLDER');
        logger.info(`FINDING LEAD: ${mail.to.address} ${mail.to.name}`);

        // * Log sent mail if lead_id or lead_to_cadence_id is embedded only
        // * All mails sent from tool should have lead_id or lead_to_cadence_id embedded

        if (lead_to_cadence_id && lead_to_cadence_id !== 'null') {
          const [leadToCadence, errLeadToCadence] = await Repository.fetchOne({
            tableName: DB_TABLES.LEADTOCADENCE,
            query: {
              lead_cadence_id: lead_to_cadence_id,
            },
            include: {
              [DB_TABLES.LEAD]: {
                [DB_TABLES.USER]: {},
              },
            },
          });
          if (errLeadToCadence) {
            logger.error(
              `Error while fetching lead to cadence links: `,
              errLeadToCadence
            );
            continue;
          }
          cadence_id = leadToCadence?.cadence_id ?? null;
          lead = leadToCadence?.Leads?.[0];
          logger.info('Fetched lead by lead_cadence_id');
        } else if (lead_id && lead_id !== 'null') {
          cadence_id = null;
          const [fetchedLead, errFetchedLead] = await Repository.fetchOne({
            tableName: DB_TABLES.LEAD,
            query: {
              lead_id,
            },
          });
          if (errFetchedLead) {
            logger.error(errFetchedLead);
          }
          lead = fetchedLead;
          logger.info('Fetched lead by lead_id');
        } else {
          cadence_id = null;
        }

        const [user, errForUser] = await Repository.fetchOne({
          tableName: DB_TABLES.USER,
          query: {
            user_id,
          },
        });
        if (errForUser) {
          logger.error(`User error occured: ${errForUser}.`);
          continue;
        }

        // * Skip if lead not found with lead_to_cadence_id or lead_id

        // if (!lead) {
        //   const [leadEmail, errLeadEmail] = await Repository.fetchOne({
        //     tableName: DB_TABLES.LEAD_EMAIL,
        //     query: {
        //       email_id: mail.to.address,
        //     },
        //     include: {
        //       [DB_TABLES.LEAD]: {
        //         where: {
        //           user_id: user_id,
        //         },
        //         [DB_TABLES.USER]: {
        //           attributes: [],
        //           where: {
        //             company_id: user.company_id,
        //           },
        //           required: true,
        //         },
        //         required: true,
        //       },
        //     },
        //   });
        //   if (errLeadEmail) {
        //     logger.error(errLeadEmail);
        //   }

        //   if (!lead) lead = leadEmail?.Lead;
        // }

        if (!lead) {
          logger.error('This email is not related to CRM.');
          logger.info(`From address: ${mail.to.address}`);
          logger.info(`Extracted lead_id: ${lead_id}`);
          continue; //This email is not related to CRM
        }

        let node, errNode;

        if (node_id) {
          [node, errNode] = await Repository.fetchOne({
            tableName: DB_TABLES.NODE,
            query: {
              node_id,
            },
          });
          if (errNode) {
            logger.error(`Error while fetching node: `, errNode);
            continue;
          }

          cadence_id = node.cadence_id;
        }

        const [success, errForUpsert] = await EmailRepository.upsert(
          user_id,
          lead.lead_id,
          mail,
          cadence_id,
          node_id,
          null,
          node && node.type === NODE_TYPES.REPLY_TO ? true : false
        );
        if (errForUpsert) {
          logger.error(`Error while upserting sent mail: `, errForUpsert);
          continue;
        }

        logger.info('Email upserted!');

        logger.info('CREATING ACTIVITY FROM MAIL WEBHOOK!');

        // check node type if reply create different activity
        let createdActivity, errForActivity;
        if (node?.type === NODE_TYPES.REPLY_TO) {
          [createdActivity, errForActivity] =
            await ActivityHelper.createAndSendReplyActivity({
              user,
              lead,
              mail,
              cadence_id: cadence_id,
              node_id: node_id,
              incoming: false,
              access_token,
              instance_url,
              integration_type: integrationType,
              company_setting: companySetting,
            });
        } else {
          [createdActivity, errForActivity] =
            await ActivityHelper.createAndSendMailActivity({
              user,
              lead,
              mail,
              sent: true,
              cadence_id,
              node_id,
              access_token,
              instance_url,
              integration_type: integrationType,
              company_setting: companySetting,
            });
        }

        if (errForActivity)
          logger.error(`Error while creating activity: ${errForActivity}`);
      } else {
        //IGNORE MESSAGE
        const [email, errForEmail] = await Repository.destroy({
          tableName: DB_TABLES.EMAIL,
          query: {
            message_id: message.id,
          },
        });
        if (errForEmail) {
          logger.error(`Error while deleting email: `, errForEmail);
          continue;
        }
      }
    }
  } catch (e) {
    logger.error(`Error while parsing messages updated: `, e);
    return;
  }
};

const parseMessagesDeleted = async (user_id, messagesDeleted = []) => {
  try {
    for (const { id } of messagesDeleted) {
      if (id) await EmailRepository.deleteByMessageId(id);
    }
  } catch (e) {
    logger.error(`Error while parsing messages deleted: ${e.message}`);
    return;
  }
};

module.exports = {
  parseMessagesUpdated,
  parseMessagesDeleted,
};
