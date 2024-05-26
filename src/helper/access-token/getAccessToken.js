// Utils
const logger = require('../../utils/winston');
const { DB_TABLES } = require('../../utils/modelEnums');
const { CRM_INTEGRATIONS, HIRING_INTEGRATIONS } = require('../../utils/enums');

// Repositories
const Repository = require('../../repository');

// Helpers
const SalesforceTokenHelper = require('./salesforceTokens');
const PipedriveTokenHelper = require('./pipedriveTokens');
const HubspotTokenHelper = require('./hubspotTokens');
const SellsyTokenHelper = require('./sellsyTokens');
const ZohoTokenHelper = require('./zohoTokens');
const BullhornTokenHelper = require('./bullhornTokens');
const DynamicsTokenHelper = require('./dynamicsTokens');

const getAccessToken = async ({ integration_type, user_id }) => {
  try {
    let include = {};
    switch (integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE:
        include[DB_TABLES.SALESFORCE_TOKENS] = {};
        break;
      case CRM_INTEGRATIONS.PIPEDRIVE:
        include[DB_TABLES.PIPEDRIVE_TOKENS] = {};
        break;
      case CRM_INTEGRATIONS.HUBSPOT:
        include[DB_TABLES.HUBSPOT_TOKENS] = {};
        break;
      case CRM_INTEGRATIONS.SELLSY:
        include[DB_TABLES.SELLSY_TOKENS] = {};
        break;
      case CRM_INTEGRATIONS.ZOHO:
        include[DB_TABLES.ZOHO_TOKENS] = {};
        break;
      case HIRING_INTEGRATIONS.BULLHORN:
        include[DB_TABLES.BULLHORN_TOKENS] = {};
        break;
      case CRM_INTEGRATIONS.SHEETS:
        return [
          {
            access_token: null,
            instance_url: null,
            integration_type,
          },
          null,
        ];
      case CRM_INTEGRATIONS.DYNAMICS:
        include[DB_TABLES.DYNAMICS_TOKENS] = {};
        break;
      default:
        // for invalid integration types
        return [
          {
            access_token: null,
            instance_url: null,
            integration_type,
          },
          null,
        ];
    }

    const [user, errForUser] = await Repository.fetchOne({
      tableName: DB_TABLES.USER,
      query: { user_id },
      include,
    });
    if (errForUser) return [null, errForUser];

    if (
      user?.Salesforce_tokens === null &&
      user?.Pipedrive_tokens === null &&
      user?.Hubspot_Tokens === null &&
      user?.Sellsy_Token === null &&
      user?.Zoho_Tokens === null &&
      user?.Bullhorn_Token === null &&
      user?.Dynamics_Token === null
    )
      return [null, 'Kindly sign in with your crm.'];

    switch (integration_type) {
      case CRM_INTEGRATIONS.SALESFORCE: {
        if (user?.Salesforce_Token === null)
          return [
            {
              access_token: null,
              instance_url: null,
              integration_type: CRM_INTEGRATIONS.SALESFORCE,
            },
            'Kindly log in with salesforce.',
          ];
        let sfTokens = user?.Salesforce_Token;
        const [tokens, errForTokens] =
          await SalesforceTokenHelper.fetchAccessToken(user_id, sfTokens);
        return [tokens, errForTokens];
      }

      case CRM_INTEGRATIONS.PIPEDRIVE: {
        if (user?.Pipedrive_Token === null)
          return [
            {
              access_token: null,
              instance_url: null,
              integration_type: CRM_INTEGRATIONS.PIPEDRIVE,
            },
            'Kindly log in with pipedrive.',
          ];
        let pdTokens = user?.Pipedrive_Token;
        const [tokens, errForTokens] =
          await PipedriveTokenHelper.fetchAccessToken(user_id, pdTokens);
        return [tokens, errForTokens];
      }

      case CRM_INTEGRATIONS.HUBSPOT: {
        if (user?.Hubspot_Token === null)
          return [
            {
              access_token: null,
              integration_type: CRM_INTEGRATIONS.HUBSPOT,
            },
            'Kindly log in with hubspot.',
          ];
        let hsTokens = user?.Hubspot_Token;
        const [tokens, errForTokens] =
          await HubspotTokenHelper.fetchAccessToken(
            user_id,
            hsTokens,
            user.integration_id
          );
        return [tokens, errForTokens];
      }
      case CRM_INTEGRATIONS.SHEETS:
        return [
          {
            access_token: null,
            instance_url: null,
            integration_type: CRM_INTEGRATIONS.SHEETS,
          },
          null,
        ];

      case CRM_INTEGRATIONS.SELLSY: {
        if (user?.Sellsy_Token === null)
          return [
            {
              access_token: null,
              integration_type: CRM_INTEGRATIONS.SELLSY,
            },
            'Kindly log in with sellsy.',
          ];
        let sellsyTokens = user?.Sellsy_Token;
        const [tokens, errForTokens] = await SellsyTokenHelper.fetchAccessToken(
          user_id,
          sellsyTokens,
          user.integration_id
        );
        return [tokens, errForTokens];
      }
      case CRM_INTEGRATIONS.ZOHO: {
        if (user?.Zoho_Token === null)
          return [
            {
              access_token: null,
              instance_url: null,
              server_url: null,
              integration_type: CRM_INTEGRATIONS.ZOHO,
            },
            'Kindly log in with zoho.',
          ];
        let zohoTokens = user?.Zoho_Token;
        const [tokens, errForTokens] = await ZohoTokenHelper.fetchAccessToken(
          user_id,
          zohoTokens
        );
        return [tokens, errForTokens];
      }
      case CRM_INTEGRATIONS.EXCEL:
        return [
          {
            access_token: null,
            instance_url: null,
            integration_type: CRM_INTEGRATIONS.EXCEL,
          },
          null,
        ];
      case HIRING_INTEGRATIONS.BULLHORN: {
        if (user?.Bullhorn_Tokens === null)
          return [
            {
              access_token: null,
              instance_url: null,
              BH_token: null,
              integration_type: CRM_INTEGRATIONS.BULLHORN,
            },
            'Kindly log in with bullhorn.',
          ];
        let bullhornTokens = user?.Bullhorn_Token;
        const [tokens, errForTokens] =
          await BullhornTokenHelper.fetchAccessToken(user_id, bullhornTokens);
        return [tokens, errForTokens];
      }

      case CRM_INTEGRATIONS.DYNAMICS: {
        if (user?.Dynamics_Token === null)
          return [
            {
              access_token: null,
              instance_url: null,
              integration_type: CRM_INTEGRATIONS.DYNAMICS,
            },
            'Kindly log in with dynamics.',
          ];

        let DynamicsTokens = user?.Dynamics_Token;
        const [tokens, errForTokens] =
          await DynamicsTokenHelper.fetchAccessToken({
            user_id: user.user_id,
            tokens: DynamicsTokens,
          });
        return [tokens, errForTokens];
      }
    }
  } catch (err) {
    logger.error('Error while fetching access token: ', err);
    return [
      {
        access_token: null,
        instance_url: null,
        integration_type: null,
      },
      err.message,
    ];
  }
};

const fetchToken = async () => {
  try {
    const [data, err] = await getAccessToken({
      integration_type: 'pipedrive',
      //user_id: '22222222-2222-2222-2222-222222222222',
      user_id: '2',
    });
    console.log(data, err);
  } catch (err) {
    console.log(err);
  }
};
//fetchToken();

module.exports = getAccessToken;
