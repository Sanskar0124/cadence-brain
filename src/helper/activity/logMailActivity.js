// Utils
const logger = require('../../utils/winston');
const {
  CRM_INTEGRATIONS,
  LEAD_INTEGRATION_TYPES,
  HIRING_INTEGRATIONS,
  SELLSY_ENDPOINTS,
} = require('../../utils/enums');
const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');

// Repositories
const Repository = require('../../repository');

// Helper and Services
const SalesforceService = require('../../services/Salesforce');
const { createMailActivity } = require('../../grpc/v2/crm-integration');
const hiringIntegration = require('../../grpc/v2/hiring-integration');

const logMailActivity = async ({
  user,
  lead,
  mail,
  sent,
  incoming,
  access_token,
  instance_url,
  integration_type,
  company_setting,
}) => {
  try {
    let mailObj;
    switch (integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE:
        mailObj = {
          subject: mail.subject ?? 'No Subject',
          email_body: mail.textHtml,
          cc_address: mail.cc,
          bcc_address: mail.bcc,
          salesforce_lead_id: lead.integration_id,
          access_token,
          instance_url,
        };

        // if sent is false or incoming is true
        if (!sent || incoming)
          mailObj = {
            ...mailObj,
            from_address: mail.from.address,
            to_address: user.primary_email ?? user.email,
            relationType: 'FromAddress',
          };
        // if sent is true or incoming is false
        else
          mailObj = {
            ...mailObj,
            from_address: user.primary_email ?? user.email,
            to_address: mail.to.address,
          };

        const [_, salesforceErr] =
          await SalesforceService.createSalesforceEmailMessage(mailObj);

        if (salesforceErr)
          logger.error(
            `Error while creating salesforce mail activity: ${salesforceErr}`
          );
        break;

      case CRM_INTEGRATIONS.PIPEDRIVE:
        const [pipedriveData, pipedriveDataError] = await createMailActivity({
          integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
          integration_data: {
            access_token,
            instance_url,
            subject: mail.subject,
            public_description: mail.textHtml,
            person_id: lead.integration_id,
          },
        });
        if (pipedriveDataError)
          logger.error(
            `Error while creating pipedrive mail activity: ${pipedriveDataError}`
          );
        break;

      case CRM_INTEGRATIONS.ZOHO:
        const mail_body = `Subject - ${mail.subject}
Body - ${mail.textHtml.replace(/(<([^>]+)>)/gi, '')}`;

        const type =
          lead.integration_type === LEAD_INTEGRATION_TYPES.ZOHO_LEAD
            ? 'Leads'
            : 'Contacts';

        const content = {
          Note_Title: `Email from ${mail.from.address} to ${mail.to.address}`,
          Note_Content: mail_body,
          Parent_Id: lead.integration_id,
          se_module: type,
        };

        const [zohoData, zohoDataError] = await createMailActivity({
          integration_type: CRM_INTEGRATIONS.ZOHO,
          integration_data: {
            access_token,
            instance_url,
            content,
          },
        });
        if (zohoDataError)
          logger.error(
            `Error while creating zoho mail activity: ${zohoDataError}`
          );
        break;

      case CRM_INTEGRATIONS.HUBSPOT:
        mailObj = {
          access_token,
          hs_timestamp: new Date(),
          hs_email_subject: mail.subject,
          hs_email_html: mail.textHtml,
          hubspot_contact_id: lead.integration_id,
          hubspot_owner_id: user.integration_id,
        };

        if (!sent || incoming) mailObj.hs_email_direction = 'INCOMING_EMAIL';
        else mailObj.hs_email_direction = 'EMAIL';

        const [hubspotData, hubspotDataError] = await createMailActivity({
          integration_type: CRM_INTEGRATIONS.HUBSPOT,
          integration_data: mailObj,
        });
        if (hubspotDataError)
          logger.error(
            `Error while creating hubspot mail activity: ${hubspotDataError}`
          );
        break;

      case HIRING_INTEGRATIONS.BULLHORN:
        const bullhorn_mail_body = `<b>Email from ${mail.from.address} to ${
          mail.to.address
        }</b> <br>
<b>Subject</b> - ${mail.subject} <br>
<b>Body</b> - ${mail.textHtml.replace(/(<([^>]+)>)/gi, '')}`;
        let bullhornContent = {};
        switch (lead.integration_type) {
          case LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT:
            bullhornContent = {
              action: 'Email',
              comments: bullhorn_mail_body,
              personReference: {
                id: lead.integration_id,
                _subtype: 'ClientContact',
              },
            };
            break;
          case LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE:
            bullhornContent = {
              action: 'Email',
              comments: bullhorn_mail_body,
              personReference: {
                id: lead.integration_id,
                _subtype: 'Candidate',
              },
            };
            break;
          case LEAD_INTEGRATION_TYPES.BULLHORN_LEAD:
            bullhornContent = {
              action: 'Email',
              personReference: {
                id: parseInt(lead.integration_id),
                _subtype: 'Lead',
              },
              comments: bullhorn_mail_body,
            };
            break;
        }
        const [bullhornData, bullhornDataError] =
          await hiringIntegration.createMailActivity({
            integration_type: HIRING_INTEGRATIONS.BULLHORN,
            integration_data: {
              access_token,
              instance_url,
              bullhornContent,
            },
          });
        if (bullhornDataError) {
          logger.error(
            `Error while creating bullhorn mail activity: ${bullhornDataError}`
          );
        }
        break;

      case CRM_INTEGRATIONS.SELLSY:
        let customActivityTypeId =
          company_setting?.custom_activity_type?.email?.id;

        let mailBody = `Subject - ${mail.subject}
Body - ${mail.textHtml.replace(/(<([^>]+)>)/gi, '')}`;

        const [sellsyData, sellsyDataError] = await createMailActivity({
          integration_type: CRM_INTEGRATIONS.SELLSY,
          integration_data: {
            access_token,
            type_id: customActivityTypeId,
            action: mailBody,
            relation: {
              id: parseInt(lead.integration_id),
              type: SELLSY_ENDPOINTS.CONTACT,
            },
            date: new Date(),
          },
        });
        if (sellsyDataError) {
          logger.error(
            `Error while creating sellsy mail activity: ${sellsyDataError}`
          );
          break;
        }
        break;

      case CRM_INTEGRATIONS.DYNAMICS:
        const dynamicsContent = {
          subject: mail.subject ?? 'No Subject',
          description: mail.textHtml ?? null,
          actualdurationminutes: 30 /* 30 minutes | not a compulsory field */,
          prioritycode: 1 /* 0: Low, 1: Normal, 2: High | not a compulsory field but keep default value: 1 */,
        };
        switch (lead.integration_type) {
          case LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT:
            dynamicsContent[
              'regardingobjectid_contact_email@odata.bind'
            ] = `/contacts(${lead.integration_id})`;
            dynamicsContent[
              'emailsender_contact@odata.bind'
            ] = `/contacts(${lead.integration_id})`;
            dynamicsContent['email_activity_parties'] = [
              {
                'partyid_contact@odata.bind': `/contacts(${lead.integration_id})`,
                participationtypemask: 2,
              },
              {
                'partyid_systemuser@odata.bind': `/systemusers(${user.integration_id})`,
                participationtypemask: 1,
              },
            ];
            break;
          case LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD:
            (dynamicsContent[
              'regardingobjectid_lead_email@odata.bind'
            ] = `/leads(${lead.integration_id})`),
              (dynamicsContent[
                'emailsender_lead@odata.bind'
              ] = `/leads(${lead.integration_id})`);
            dynamicsContent['email_activity_parties'] = [
              {
                'partyid_lead@odata.bind': `/leads(${lead.integration_id})`,
                participationtypemask: 2,
              },
              {
                'partyid_systemuser@odata.bind': `/systemusers(${user.integration_id})`,
                participationtypemask: 1,
              },
            ];
            break;
        }
        if (mail.cc) {
          let cc = mail.cc.split(/[\s,]+/);
          const [ccLeads, err] = await Repository.fetchAll({
            tableName: DB_TABLES.LEAD_EMAIL,
            query: {
              email_id: {
                [Op.in]: cc,
              },
            },
            include: {
              [DB_TABLES.LEAD]: {
                where: {
                  company_id: lead.company_id,
                },
                attributes: ['integration_id', 'integration_type'],
                required: true,
              },
            },
          });
          for (let ccLead of ccLeads) {
            if (
              ccLead.Lead.integration_type ===
              LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT
            ) {
              dynamicsContent['email_activity_parties'].push({
                'partyid_contact@odata.bind': `/contacts(${ccLead.Lead.integration_id})`,
                participationtypemask: 3,
              });
            } else if (
              ccLead.Lead.integration_type ===
              LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD
            ) {
              dynamicsContent['email_activity_parties'].push({
                'partyid_lead@odata.bind': `/leads(${ccLead.Lead.integration_id})`,
                participationtypemask: 3,
              });
            }
          }
        }
        if (mail.bcc) {
          let bcc = mail.bcc.split(/[\s,]+/);
          const [bccLeads, errr] = await Repository.fetchAll({
            tableName: DB_TABLES.LEAD_EMAIL,
            query: {
              email_id: {
                [Op.in]: bcc,
              },
            },
            include: {
              [DB_TABLES.LEAD]: {
                where: {
                  company_id: lead.company_id,
                },
                attributes: ['integration_id', 'integration_type'],
                required: true,
              },
            },
          });
          for (let bccLead of bccLeads) {
            if (
              bccLead.Lead.integration_type ===
              LEAD_INTEGRATION_TYPES.DYNAMICS_CONTACT
            ) {
              dynamicsContent['email_activity_parties'].push({
                'partyid_contact@odata.bind': `/contacts(${bccLead.Lead.integration_id})`,
                participationtypemask: 4,
              });
            } else if (
              bccLead.Lead.integration_type ===
              LEAD_INTEGRATION_TYPES.DYNAMICS_LEAD
            ) {
              dynamicsContent['email_activity_parties'].push({
                'partyid_lead@odata.bind': `/leads(${bccLead.Lead.integration_id})`,
                participationtypemask: 4,
              });
            }
          }
        }

        const [dynamicsData, dynamicsDataError] = await createMailActivity({
          integration_type: CRM_INTEGRATIONS.DYNAMICS,
          integration_data: {
            access_token,
            instance_url,
            content: dynamicsContent,
          },
        });
        if (dynamicsDataError)
          logger.error(
            `Error while creating dynamics mail activity: ${dynamicsDataError}`
          );
        break;

      default:
        logger.error(`Bad Integration type.`);
    }

    return;
  } catch (err) {
    logger.error(`Error while trying to log mail activity: `, err);
    return;
  }
};

module.exports = logMailActivity;
