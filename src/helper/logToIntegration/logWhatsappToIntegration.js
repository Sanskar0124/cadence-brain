const logger = require('../../utils/winston');
const {
  successResponse,
  notFoundResponse,
  unprocessableEntityResponse,
  serverErrorResponseWithDevMsg,
} = require('../../utils/response');
const {
  ACTIVITY_TYPE,
  LEAD_STATUS,
  CRM_INTEGRATIONS,
  LEAD_INTEGRATION_TYPES,
  HIRING_INTEGRATIONS,
  SELLSY_ENDPOINTS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// DB
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// Helpers and services
const SalesforceService = require('../../services/Salesforce');
const ActivityHelper = require('../activity');
const AccessTokenHelper = require('../access-token');
const { createNoteActivity } = require('../../grpc/v2/crm-integration');
const hiringIntegration = require('../../grpc/v2/hiring-integration');
const logWhatsappToIntegration = async ({ lead_id, activity }) => {
  try {
    const [lead, errForLead] = await Repository.fetchOne({
      tableName: DB_TABLES.LEAD,
      query: { lead_id: lead_id },
      include: {
        [DB_TABLES.USER]: {
          attributes: ['user_id'],
          [DB_TABLES.COMPANY]: {
            attributes: ['company_id', 'integration_type'],
            [DB_TABLES.COMPANY_SETTINGS]: {
              //attributes: ['sf_activity_to_log'],
              attributes: ['activity_to_log'],
            },
          },
        },
      },
      extras: {
        attributes: [
          'first_name',
          'last_name',
          'salesforce_lead_id',
          'salesforce_contact_id',
          'integration_id',
          'integration_type',
        ],
      },
    });
    if (errForLead) {
      logger.error(`Error while fetching lead ${errForLead}`);
      return [null, errForLead];
    }
    if (!lead) {
      logger.error('No lead present with given id');
      return [null, `No lead present with given id`];
    }
    if (
      //lead?.User?.Company?.Company_Setting?.sf_activity_to_log?.NOTE?.enabled
      lead?.User?.Company?.Company_Setting?.activity_to_log?.WHATSAPP
        ?.enabled ||
      true
    ) {
      let access_token = '',
        instance_url = '',
        errForAccessToken = '';
      switch (lead?.User?.Company?.integration_type) {
        case CRM_INTEGRATIONS.SALESFORCE:
          [{ access_token, instance_url }, errForAccessToken] =
            await AccessTokenHelper.getAccessToken({
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
              user_id: lead?.User.user_id,
            });
          if (access_token && instance_url) {
            const [salesforce_note_id, salesforceErr] =
              await SalesforceService.Note.createSalesforceNote(
                activity.status,
                activity.type,
                lead.salesforce_lead_id ?? lead.salesforce_contact_id,
                access_token,
                instance_url
              );
          }
          break;
        case CRM_INTEGRATIONS.PIPEDRIVE:
          [{ access_token, instance_url }, errForAccessToken] =
            await AccessTokenHelper.getAccessToken({
              integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
              user_id: lead?.User.user_id,
            });
          if (access_token === null || instance_url === null) {
            logger.error(
              '\nError while getting access token or instance url:\n',
              errForAccessToken
            );
            return [null, errForAccessToken];
          }
          const [pipedriveData, pipedriveDataError] = await createNoteActivity({
            integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
            integration_data: {
              access_token,
              instance_url,
              content: `<B>${activity.type}</B><br>${activity.status}`,
              person_id: lead.integration_id,
            },
          });
          if (pipedriveDataError) {
            logger.error(
              `Error while creating pipedrive note: `,
              pipedriveDataError
            );
            return [null, pipedriveDataError];
          }
          break;
        case CRM_INTEGRATIONS.HUBSPOT:
          [{ access_token }, errForAccessToken] =
            await AccessTokenHelper.getAccessToken({
              integration_type: CRM_INTEGRATIONS.HUBSPOT,
              user_id: lead?.User.user_id,
            });
          if (access_token === null) {
            logger.error(
              '\nError while getting access token or instance url:\n',
              errForAccessToken
            );
            return [null, errForAccessToken];
          }

          const [hubspotData, hubspotDataError] = await createNoteActivity({
            integration_type: CRM_INTEGRATIONS.HUBSPOT,
            integration_data: {
              access_token,
              hs_timestamp: new Date(),
              hs_note_body: `<h4>${activity.type}</h4>${activity.status}`,
              hubspot_contact_id: lead.integration_id,
            },
          });
          if (hubspotDataError) {
            logger.error(
              `Error while creating hubspot note: `,
              hubspotDataError
            );
            return [null, hubspotDataError];
          }
          break;
        case CRM_INTEGRATIONS.ZOHO:
          [{ access_token, instance_url }, errForAccessToken] =
            await AccessTokenHelper.getAccessToken({
              integration_type: CRM_INTEGRATIONS.ZOHO,
              user_id: lead?.User.user_id,
            });
          if (access_token === null || instance_url === null) {
            logger.error('\n Please sign in with zoho:\n', errForAccessToken);
            return [null, errForAccessToken];
          }
          const type =
            lead.integration_type === LEAD_INTEGRATION_TYPES.ZOHO_LEAD
              ? 'Leads'
              : 'Contacts';
          const content = {
            Note_Title: activity.type,
            Note_Content: activity.status,
            Parent_Id: lead.integration_id,
            se_module: type,
          };
          const [zohoData, zohoDataError] = await createNoteActivity({
            integration_type: CRM_INTEGRATIONS.ZOHO,
            integration_data: {
              access_token,
              instance_url,
              content,
            },
          });
          if (zohoDataError) {
            logger.error(`Error while creating zoho note: `, zohoDataError);
            return [null, zohoDataError];
          }
          break;
        case HIRING_INTEGRATIONS.BULLHORN:
          [{ access_token, instance_url }, errForAccessToken] =
            await AccessTokenHelper.getAccessToken({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              user_id: lead.User.user_id,
            });
          if (access_token === null || instance_url === null) {
            logger.error(
              '\n Please sign in with bullhorn:\n',
              errForAccessToken
            );
            return [null, errForAccessToken];
          }
          let bullhornContent = {};
          switch (lead.integration_type) {
            case LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT:
              bullhornContent = {
                action: 'Other',
                comments: `<b>Title :</b> ${activity.type} <br>
    
<b>Content :</b> ${activity.status}`,
                personReference: {
                  id: lead.integration_id,
                  _subtype: 'ClientContact',
                },
              };
              break;
            case LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE:
              bullhornContent = {
                action: 'Other',
                comments: `<b>Title :</b> ${activity.type} <br>
    
<b>Content :</b> ${activity.status}`,
                personReference: {
                  id: lead.integration_id,
                  _subtype: 'Candidate',
                },
              };
              break;
            case LEAD_INTEGRATION_TYPES.BULLHORN_LEAD:
              bullhornContent = {
                action: 'Other',
                personReference: {
                  id: parseInt(lead.integration_id),
                  _subtype: 'Lead',
                },
                comments: `<b>Title :</b> ${activity.type} <br>
    
<b>Content :</b> ${activity.status}`,
              };
              break;
          }
          const [bullhornData, bullhornDataError] =
            await hiringIntegration.createNoteActivity({
              integration_type: HIRING_INTEGRATIONS.BULLHORN,
              integration_data: {
                access_token,
                instance_url,
                bullhornContent,
              },
            });
          if (bullhornDataError) {
            logger.error(
              `Error while creating bullhorn note: `,
              bullhornDataError
            );
            return [null, bullhornDataError];
          }
          break;
        case CRM_INTEGRATIONS.DYNAMICS:
          [{ access_token, instance_url }, errForAccessToken] =
            await AccessTokenHelper.getAccessToken({
              integration_type: CRM_INTEGRATIONS.DYNAMICS,
              user_id: lead?.User.user_id,
            });
          if (access_token === null || instance_url === null) {
            logger.error(
              '\n Please sign in with dynamics:\n',
              errForAccessToken
            );
            return [null, errForAccessToken];
          }
          const dynamicsContent = {
            subject: activity.type,
            notetext: activity.status,
          };
          if (lead.integration_type === LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT)
            dynamicsContent[
              'objectid_contact@odata.bind'
            ] = `/contacts(${lead.integration_id})`;
          else
            dynamicsContent[
              'objectid_lead@odata.bind'
            ] = `/leads(${lead.integration_id})`;
          const [dynamicsData, dynamicsDataError] = await createNoteActivity({
            integration_type: CRM_INTEGRATIONS.DYNAMICS,
            integration_data: {
              access_token,
              instance_url,
              content: dynamicsContent,
            },
          });
          if (dynamicsDataError) {
            logger.error(
              `Error while creating dynamics note: `,
              dynamicsDataError
            );
            return [null, dynamicsDataError];
          }
          break;
        default:
          logger.error(`Bad integration type.`);
          return [null, 'Bad integration type.'];
      }
      return ['Activity logged successfully', null];
    }
  } catch (error) {
    logger.error(`Error while logging whatsapp activity: `, error);
    return;
  }
};

module.exports = logWhatsappToIntegration;
