// Utils
const logger = require('../../utils/winston');
const {
  CRM_INTEGRATIONS,
  LEAD_INTEGRATION_TYPES,
  HIRING_INTEGRATIONS,
} = require('../../utils/enums');

// Packages
const { Liquid } = require('liquidjs');
const replaceall = require('replaceall');

// Helpers and Services
const AccessTokenHelper = require('../access-token/');
const CustomVariablesHelper = require('./customVariables');
const {
  describeObject,
  getCandidate,
} = require('../../grpc/v2/hiring-integration');
const formatter = require('./customVariables/utils/formatter');

const handleFunctionalVariables = (template) => {
  try {
    const regexNot = /{{!\s*([^}]+)\s*}}/g;
    const regexCustomLink = /{{\s*custom_link\((.*?)\)\s*}}/g;
    const regexUnsubscribeLink = /{{\s*unsubscribe\((.*?)\)\s*}}/g;
    const regexDays =
      /\s*(?:today|tomorrow)_day\((?:en|fr|es)\)(?:_capital)?\s*/g;
    const regexNDays =
      /\s*(\d+)_?(?:week_)?days_?(?:from_now|ago)?(?:_?day\((en|fr|es)\))?\s*/g;
    const signatureRegex = /\s*user_signature?\s*([^}]+)\s*/g;
    const meetRegex = /\s*(ringover_meet|calendly_link)\s*/g;
    // Select today or tomorrow with the braces unlike other vars
    const regexTodayTomorrow = /{{\s*(today|tomorrow)\s*}}/g;

    let regexPatterns = [regexDays, regexNDays, signatureRegex, meetRegex];
    const combinedRegexPattern = regexPatterns
      .map((regex) => regex.source)
      .join('|');
    const combinedRegex = new RegExp(combinedRegexPattern, 'g');

    let linkRegexPatterns = [regexCustomLink, regexUnsubscribeLink];
    const combinedLinkRegexPattern = linkRegexPatterns
      .map((regex) => regex.source)
      .join('|');
    const combinedLinkRegex = new RegExp(combinedLinkRegexPattern, 'g');
    let modifiedTemplate = template.replace(regexNot, '');
    modifiedTemplate = modifiedTemplate.replace(combinedRegex, '"{{$&}}"');
    modifiedTemplate = modifiedTemplate.replace(
      combinedLinkRegex,
      '{%raw%}$&{%endraw%}'
    );
    modifiedTemplate = modifiedTemplate.replace(regexTodayTomorrow, '{{"$&"}}');

    return [modifiedTemplate, null];
  } catch (err) {
    logger.error(
      'An error occured while handling functional variables for liquid support',
      err.message
    );
    return [null, err.message];
  }
};

const unescapeHTML = (escapedHTML) => {
  return escapedHTML
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/“|”/g, '"');
};

/**
 *
 * @param {*} lead - Mandatory to pass Account and User withing lead
 * @param {*} stringArrayToProcess - a list of strings
 * @param {*} standardVariables - standard prospect/account/sender variables
 * @param {*} preview - for preprocessing field map variables only
 */
const replaceCustomVariables = async (
  lead,
  stringArrayToProcess,
  standardVariables,
  preview = false
) => {
  try {
    let variables = {};
    let unprocessedVarsSuffixes = [];
    const crmIntegration = lead?.User?.Company?.integration_type;

    // Fetching token and instance url
    const [{ access_token, instance_url }, errForAccessToken] =
      await AccessTokenHelper.getAccessToken({
        user_id: lead?.user_id,
        integration_type: crmIntegration,
      });

    // Checking the CRM integration type and adding relevant maps to variables accordingly
    if (!errForAccessToken) {
      switch (crmIntegration) {
        case CRM_INTEGRATIONS.SALESFORCE: {
          // Checking whether the lead is of type 'salesforce_lead' or 'salesforce_contact'
          // If its a 'salesforce_lead' then only getLeadsMap is called
          // But if its a 'salesforce_contact' then both getContactsMap & getAccountsMap are called
          switch (lead?.integration_type) {
            case LEAD_INTEGRATION_TYPES.SALESFORCE_LEAD: {
              const [leadMap, errForLeadMap] =
                await CustomVariablesHelper.getMapForLeads(
                  CRM_INTEGRATIONS.SALESFORCE,
                  lead?.integration_id,
                  access_token,
                  instance_url
                );
              if (errForLeadMap) {
                logger.error(
                  `Error while fetching salesforce lead: ${errForLeadMap}`
                );
                unprocessedVarsSuffixes.push('_L');
                break;
              }
              variables = {
                ...variables,
                ...leadMap,
              };
              break;
            }
            case LEAD_INTEGRATION_TYPES.SALESFORCE_CONTACT: {
              const [
                [contactMap, errForContactMap],
                [accountMap, errForAccountMap],
              ] = await Promise.all([
                CustomVariablesHelper.getMapForContacts(
                  CRM_INTEGRATIONS.SALESFORCE,
                  lead?.integration_id,
                  access_token,
                  instance_url
                ),
                CustomVariablesHelper.getMapForAccounts(
                  CRM_INTEGRATIONS.SALESFORCE,
                  lead?.Account?.integration_id,
                  access_token,
                  instance_url
                ),
              ]);
              if (errForContactMap || errForAccountMap) {
                logger.error(
                  `Error while fetching salesforce contact: ${
                    errForContactMap ?? errForAccountMap
                  }`
                );
                unprocessedVarsSuffixes.push('_C', '_A');
                break;
              }
              variables = {
                ...variables,
                ...contactMap,
                ...accountMap,
              };
              break;
            }
          }
          break;
        }

        case CRM_INTEGRATIONS.HUBSPOT: {
          const [
            [contactMap, errForContactMap],
            [accountMap, errForAccountMap],
          ] = await Promise.all([
            CustomVariablesHelper.getMapForContacts(
              CRM_INTEGRATIONS.HUBSPOT,
              lead?.integration_id,
              access_token,
              instance_url
            ),
            CustomVariablesHelper.getMapForAccounts(
              CRM_INTEGRATIONS.HUBSPOT,
              lead?.Account?.integration_id,
              access_token,
              instance_url
            ),
          ]);
          if (errForContactMap) {
            logger.error(
              `Error while fetching hubspot contact: ${errForContactMap}`
            );
            unprocessedVarsSuffixes.push('_C', '_Co');
            break;
          }
          variables = {
            ...variables,
            ...contactMap,
          };
          if (errForAccountMap) {
            logger.error(
              `Error while fetching hubspot company: ${errForAccountMap}`
            );
            unprocessedVarsSuffixes.push('_Co');
            break;
          }
          variables = {
            ...variables,
            ...accountMap,
          };
          break;
        }

        case CRM_INTEGRATIONS.PIPEDRIVE: {
          const [
            [contactMap, errForContactMap],
            [accountMap, errForAccountMap],
          ] = await Promise.all([
            CustomVariablesHelper.getMapForContacts(
              CRM_INTEGRATIONS.PIPEDRIVE,
              lead?.integration_id,
              access_token,
              instance_url
            ),
            CustomVariablesHelper.getMapForAccounts(
              CRM_INTEGRATIONS.PIPEDRIVE,
              lead?.Account?.integration_id,
              access_token,
              instance_url
            ),
          ]);
          if (errForContactMap || errForAccountMap) {
            logger.error(
              `Error while fetching pipedrive person: ${
                errForContactMap ?? errForAccountMap
              }`
            );
            unprocessedVarsSuffixes.push('_P', '_O');
            break;
          }
          variables = {
            ...variables,
            ...contactMap,
            ...accountMap,
          };
          break;
        }

        case CRM_INTEGRATIONS.ZOHO: {
          switch (lead?.integration_type) {
            case LEAD_INTEGRATION_TYPES.ZOHO_LEAD: {
              const [leadMap, errForLeadMap] =
                await CustomVariablesHelper.getMapForLeads(
                  CRM_INTEGRATIONS.ZOHO,
                  lead?.integration_id,
                  access_token,
                  instance_url
                );
              if (errForLeadMap) {
                logger.error(
                  `Error while fetching zoho lead: ${errForLeadMap}`
                );
                unprocessedVarsSuffixes.push('_L');
                break;
              }
              variables = {
                ...variables,
                ...leadMap,
              };
              break;
            }

            case LEAD_INTEGRATION_TYPES.ZOHO_CONTACT: {
              const [
                [contactMap, errForContactMap],
                [accountMap, errForAccountMap],
              ] = await Promise.all([
                CustomVariablesHelper.getMapForContacts(
                  CRM_INTEGRATIONS.ZOHO,
                  lead?.integration_id,
                  access_token,
                  instance_url
                ),
                CustomVariablesHelper.getMapForAccounts(
                  CRM_INTEGRATIONS.ZOHO,
                  lead?.Account?.integration_id,
                  access_token,
                  instance_url
                ),
              ]);
              if (errForContactMap || errForAccountMap) {
                logger.error(
                  `Error while fetching zoho contact: ${
                    errForContactMap ?? errForAccountMap
                  }`
                );
                unprocessedVarsSuffixes.push('_C', '_A');
                break;
              }
              variables = {
                ...variables,
                ...contactMap,
                ...accountMap,
              };
              break;
            }
          }
          break;
        }

        case CRM_INTEGRATIONS.SELLSY: {
          const [
            [contactMap, errForContactMap],
            [accountMap, errForAccountMap],
          ] = await Promise.all([
            CustomVariablesHelper.getMapForContacts(
              CRM_INTEGRATIONS.SELLSY,
              lead?.integration_id,
              access_token,
              instance_url
            ),
            CustomVariablesHelper.getMapForAccounts(
              CRM_INTEGRATIONS.SELLSY,
              lead?.Account?.integration_id,
              access_token,
              instance_url
            ),
          ]);
          if (errForContactMap || errForAccountMap) {
            logger.error(
              `Error while fetching sellsy contact: ${
                errForContactMap ?? errForAccountMap
              }`
            );
            unprocessedVarsSuffixes.push('_C', '_Co');
            break;
          }
          variables = {
            ...variables,
            ...contactMap,
            ...accountMap,
          };
          break;
        }

        case CRM_INTEGRATIONS.BULLHORN: {
          switch (lead?.integration_type) {
            case LEAD_INTEGRATION_TYPES.BULLHORN_LEAD: {
              const [[leadMap, errForLeadMap], [accountMap, errForAccountMap]] =
                await Promise.all([
                  CustomVariablesHelper.getMapForLeads(
                    CRM_INTEGRATIONS.BULLHORN,
                    lead?.integration_id,
                    access_token,
                    instance_url
                  ),
                  CustomVariablesHelper.getMapForAccounts(
                    CRM_INTEGRATIONS.BULLHORN,
                    lead?.Account?.integration_id,
                    access_token,
                    instance_url
                  ),
                ]);
              if (errForLeadMap || errForAccountMap) {
                logger.error(
                  `Error while fetching bullhorn lead: ${
                    errForLeadMap ?? errForAccountMap
                  }`
                );
                unprocessedVarsSuffixes.push('_L', '_A');
                break;
              }
              variables = {
                ...variables,
                ...leadMap,
                ...accountMap,
              };
              break;
            }
            case LEAD_INTEGRATION_TYPES.BULLHORN_CONTACT: {
              const [
                [contactMap, errForContactMap],
                [accountMap, errForAccountMap],
              ] = await Promise.all([
                CustomVariablesHelper.getMapForContacts(
                  CRM_INTEGRATIONS.BULLHORN,
                  lead?.integration_id,
                  access_token,
                  instance_url
                ),
                CustomVariablesHelper.getMapForAccounts(
                  CRM_INTEGRATIONS.BULLHORN,
                  lead?.Account?.integration_id,
                  access_token,
                  instance_url
                ),
              ]);
              if (errForContactMap || errForAccountMap) {
                logger.error(
                  `Error while fetching bullhorn contact: ${
                    errForContactMap ?? errForAccountMap
                  }`
                );
                unprocessedVarsSuffixes.push('_C', '_A');
                break;
              }
              variables = {
                ...variables,
                ...contactMap,
                ...accountMap,
              };
              break;
            }
            case LEAD_INTEGRATION_TYPES.BULLHORN_CANDIDATE: {
              const [
                [fieldData, errForFieldData],
                [candidateData, errForCandidateData],
              ] = await Promise.all([
                describeObject({
                  integration_type: CRM_INTEGRATIONS.BULLHORN,
                  integration_data: JSON.stringify({
                    object: 'candidate',
                    access_token,
                    instance_url,
                  }),
                }),
                getCandidate({
                  integration_type: CRM_INTEGRATIONS.BULLHORN,
                  integration_data: {
                    candidate_id: lead?.integration_id,
                    access_token,
                    instance_url,
                  },
                }),
              ]);
              if (errForFieldData || errForCandidateData) {
                logger.error(
                  `Error while fetching bullhorn candidate: ${
                    errForFieldData ?? errForCandidateData
                  }`
                );
                unprocessedVarsSuffixes.push('_Cn');
                break;
              }

              const fieldMap = {};
              fieldData?.fields?.forEach((field) => {
                if (
                  field.readOnly == false &&
                  Object.keys(field).includes('dataType') &&
                  field.dataType !== 'Address' &&
                  field.dataType !== 'SecondaryAddress' &&
                  field.dataType !== 'OnboardingReceivedSent' &&
                  field.dataType !== 'BillingAddress'
                ) {
                  const formatedLabel = formatter(field.label, 'candidate');
                  fieldMap[formatedLabel] = candidateData[field.name];
                }
              });
              variables = {
                ...variables,
                ...fieldMap,
              };
              break;
            }
          }
          break;
        }
      }
    }
    let processedContent = stringArrayToProcess?.map((content) => {
      let [template, errForProcessingFunctionalVariables] =
        handleFunctionalVariables(content);
      if (errForProcessingFunctionalVariables) return content;
      template = unescapeHTML(template);
      return template;
    });
    // Checking for variables in each string in string array and replacing them with their values
    // This process is only done for custom variables with field map because they may contain
    // special chars
    processedContent = processedContent?.map((str) => {
      Object.keys(variables).forEach((variable) => {
        if (str.includes(variable)) {
          const regex = new RegExp('\\b' + variable + '\\b', 'gi');
          str = str.replace(
            regex,
            variables[variable] ? `"${variables[variable]?.toString()}"` : `""`
          );
        }
      });
      return str;
    });
    // If unprocessedVarsSuffixes array has some length then the custom variables with that suffixes
    // should be removed as they can't be processed by liquid engine
    if (unprocessedVarsSuffixes.length > 0) {
      processedContent = processedContent?.map((str) => {
        unprocessedVarsSuffixes.forEach((suffix) => {
          const regex = new RegExp(
            '{{\\s*\\b.*?' + suffix + '\\b\\s*.*?}}',
            'gi'
          );
          str = str.replace(regex, '');
        });
        return str;
      });
    }
    let processedStringArray;
    const liquidTemplateEgine = new Liquid({
      timezoneOffset: lead?.User?.timezone,
    });
    try {
      processedStringArray = await Promise.all(
        processedContent?.map((content) => {
          const renderedContent = liquidTemplateEgine.parseAndRender(
            content,
            standardVariables
          );
          return renderedContent;
        })
      );
    } catch (err) {
      return [null, `Liquid Syntax Error: ${err}`];
    }
    return [processedStringArray, null];
  } catch (err) {
    logger.error('Error while replacing custom variables: ', err);
    return [null, err.message];
  }
};

module.exports = replaceCustomVariables;
