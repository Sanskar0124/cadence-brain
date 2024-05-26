// Utils
const logger = require('../../utils/winston');
const {
  CADENCE_PRIORITY,
  CADENCE_STATUS,
  CADENCE_TYPES,
  NODE_TYPES,
  CRM_INTEGRATIONS,
} = require('../../utils/enums');

const { DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');

// Repositories
const Repository = require('../../repository');

// * Helpers and Services
const addNodeToCadence = require('./addNodeToCadence');
const AccessTokenHelper = require('../access-token/');
const SalesforceService = require('../../services/Salesforce');

// * Create inbound sales cadence
const createInboundSalesCadence = async ({
  company_id,
  user_id,
  integration_type,
  t,
}) => {
  try {
    // * Create a cadence
    const [cadence, errForCadence] = await Repository.create({
      tableName: DB_TABLES.CADENCE,
      createObject: {
        company_id: company_id,
        description: 'Cadence for all inbound leads',
        inside_sales: '0',
        integration_type: integration_type,
        name: 'Inbound Sales Cadence',
        priority: CADENCE_PRIORITY.STANDARD,
        remove_if_bounce: false,
        remove_if_reply: false,
        scheduled: false,
        status: CADENCE_STATUS.NOT_STARTED,
        type: CADENCE_TYPES.COMPANY,
        user_id: user_id,
      },
      t,
    });
    if (errForCadence) return [null, errForCadence];

    let inboundCadenceNodes = [
      {
        name: 'Call',
        type: 'call',
        is_urgent: true,
        is_first: true,
        step_number: 1,
        data: {
          script: '',
        },
        wait_time: 0,
      },
      {
        name: 'Call',
        type: 'call',
        is_urgent: false,
        is_first: false,
        step_number: 2,
        data: {
          script: '',
        },
        wait_time: 30,
      },
      {
        name: 'Automated Mail',
        type: 'automated_mail',
        is_urgent: false,
        is_first: false,
        step_number: 3,
        data: {
          aBTestEnabled: false,
          attachments: [],
          body: '',
          subject: 'First steps',
          templates: [],
        },
        wait_time: 15,
      },
      {
        name: 'Call',
        type: 'call',
        is_urgent: false,
        is_first: false,
        step_number: 4,
        data: {
          script: '',
        },
        wait_time: 1440,
      },
      {
        name: 'Semi Automated Message',
        type: 'message',
        is_urgent: false,
        is_first: false,
        step_number: 5,
        data: {
          message: '',
        },
        wait_time: 1,
      },
      {
        name: 'Reply to',
        type: 'reply_to',
        is_urgent: false,
        is_first: false,
        step_number: 6,
        data: {
          aBTestEnabled: false,
          attachments: [],
          body: '',
          subject: 'Re: ',
          templates: [],
        },
        wait_time: 1440,
      },
      {
        name: 'Call',
        type: 'call',
        is_urgent: false,
        is_first: false,
        step_number: 7,
        data: {
          script: '',
        },
        wait_time: 60,
      },
    ];

    let previousNode = null;
    let replyToId = null;
    for (let node of inboundCadenceNodes) {
      let oldNodeId = node.node_id;
      node.cadence_id = cadence.cadence_id;
      if (
        [NODE_TYPES.REPLY_TO, NODE_TYPES.AUTOMATED_REPLY_TO].includes(node.type)
      )
        node.data.replied_node_id = replyToId;

      // * create a node
      const [createdNode, errForNode] = await addNodeToCadence(
        node,
        previousNode?.node_id
      );
      if (errForNode) return [null, errForNode];
      if (node.step_number === 3) replyToId = createdNode.node_id;
      previousNode = createdNode;
    }

    logger.info('Successfully created mock Inbound Sales Cadence');
  } catch (err) {
    logger.error(
      'An error occurred while creating Inbound sales cadence: ',
      err
    );
    return [null, err.message];
  }
};

// * Create inbound sales cadence
const createOutboundProspectingCadence = async ({
  company_id,
  user_id,
  integration_type,
  t,
}) => {
  try {
    // * Create a cadence
    const [cadence, errForCadence] = await Repository.create({
      tableName: DB_TABLES.CADENCE,
      createObject: {
        company_id: company_id,
        description: 'Cadence for all outbound leads',
        inside_sales: '0',
        integration_type: integration_type,
        name: ' Outbound prospecting Cadence',
        priority: CADENCE_PRIORITY.STANDARD,
        remove_if_bounce: false,
        remove_if_reply: false,
        scheduled: false,
        status: CADENCE_STATUS.NOT_STARTED,
        type: CADENCE_TYPES.COMPANY,
        user_id: user_id,
      },
      t,
    });
    if (errForCadence) return [null, errForCadence];

    let outboundCadenceNodes = [
      {
        name: 'Linkedin Connection Request',
        type: 'linkedin_connection',
        is_urgent: false,
        is_first: true,
        step_number: 1,
        data: {
          message: '',
        },
        wait_time: 0,
      },
      {
        name: 'Mail',
        type: 'automated_mail',
        is_urgent: false,
        is_first: false,
        step_number: 2,
        data: {
          aBTestEnabled: false,
          attachments: [],
          bcc: '',
          body: '',
          cc: '',
          subject: '',
          templates: [],
        },
        wait_time: 1440,
      },
      {
        name: 'Call',
        type: 'call',
        is_urgent: true,
        is_first: false,
        step_number: 3,
        data: {
          script: '',
        },
        wait_time: 120,
      },
      {
        name: 'Mail',
        type: 'mail',
        is_urgent: false,
        is_first: false,
        step_number: 4,
        data: {
          aBTestEnabled: false,
          attachments: [],
          bcc: '',
          body: '',
          cc: '',
          subject: '',
          templates: [],
        },
        wait_time: 2880,
      },
      {
        name: 'Call',
        type: 'call',
        is_urgent: false,
        is_first: false,
        step_number: 5,
        data: {
          script: '',
        },
        wait_time: 120,
      },
      {
        name: 'SMS',
        type: 'message',
        is_urgent: false,
        is_first: false,
        step_number: 6,
        data: {
          message: '',
        },
        wait_time: 10,
      },
      {
        name: 'Reply to',
        type: 'reply_to',
        is_urgent: false,
        is_first: false,
        step_number: 7,
        data: {
          aBTestEnabled: false,
          attachments: [],
          body: '',
          replied_node_id: '',
          subject: 'Re: ',
          templates: [],
        },
        wait_time: 1440,
      },
      {
        name: 'Call',
        type: 'call',
        is_urgent: false,
        is_first: false,
        step_number: 8,
        data: {
          script: '',
        },
        wait_time: 60,
      },
      {
        name: 'Linkedin Message',
        type: 'linkedin_message',
        is_urgent: false,
        is_first: false,
        step_number: 9,
        data: {
          message: '',
        },
        wait_time: 1440,
      },
      {
        name: 'Call',
        type: 'call',
        is_urgent: false,
        is_first: false,
        step_number: 10,
        data: {
          script: '',
        },
        wait_time: 1440,
      },
      {
        name: 'End Cadence',
        type: 'end',
        is_urgent: false,
        is_first: false,
        step_number: 11,
        next_node_id: null,
        data: {
          account_reason: '',
          account_status: '',
          cadence_id: '',
          lead_reason: '',
          lead_status: '',
          to_user_id: '',
        },
        wait_time: 0,
      },
    ];

    let previousNode = null;
    let replyToId = null;
    for (let node of outboundCadenceNodes) {
      let oldNodeId = node.node_id;
      node.cadence_id = cadence.cadence_id;
      if (
        [NODE_TYPES.REPLY_TO, NODE_TYPES.AUTOMATED_REPLY_TO].includes(node.type)
      )
        node.data.replied_node_id = replyToId;

      // * create a node
      const [createdNode, errForNode] = await addNodeToCadence(
        node,
        previousNode?.node_id
      );
      if (errForNode) return [null, errForNode];
      if (node.step_number === 4) replyToId = createdNode.node_id;
      previousNode = createdNode;
    }

    logger.info('Successfully created mock Outbound Sales Cadence');
  } catch (err) {
    logger.error(
      'An error occurred while creating Outbound sales cadence: ',
      err
    );
    return [null, err.message];
  }
};

const createMockCadences = async ({
  company_id,
  user_id,
  integration_type,
  t,
}) => {
  try {
    await Promise.all([
      createInboundSalesCadence({
        company_id,
        user_id,
        integration_type,
        t,
      }),
      createOutboundProspectingCadence({
        company_id,
        user_id,
        integration_type,
        t,
      }),
    ]);

    return ['Created mock cadences for user.', null];
  } catch (err) {
    logger.info(`Error while creating mock cadences: `, err);
    return [null, err.message];
  }
};

module.exports = createMockCadences;
