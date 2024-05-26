// Utils
const logger = require('../../../utils/winston');

// Packages
const axios = require('axios');
const { phone } = require('phone');

// Helpers and Services
const VariablesHelper = require('../../../helper/variables');
const ROUTES = require('../constants/ROUTES');
const {
  RINGOVER_API_URL,
  RINGOVER_API_US_URL,
} = require('../../../utils/config');
const http = require('../utils/http');
const RingoverHelper = require('../../../helper/ringover-service');
const { RESPONSE_STATUS_CODE } = require('../../../utils/enums');

const send = async (apiKey, from_number, to_number, content, lead_id) => {
  try {
    // if (to_number?.toString()[0] != '+') {
    //   to_number = `+${to_number}`;
    // }

    let errForContent = '';

    // to be uncommented
    [content, errForContent] = await VariablesHelper.replaceVariablesForLead(
      content,
      lead_id
    );
    if (errForContent) return [null, errForContent];

    // const body = {

    // };

    // * Create conversation
    const body = {
      archived_auto: false,
      from_number,
      to_number,
      content,
    };

    let URL = `${RINGOVER_API_URL}${ROUTES.SEND_MESSAGE}`;
    if (apiKey.startsWith('US_'))
      URL = `${RINGOVER_API_US_URL}${ROUTES.SEND_MESSAGE}`;

    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `${apiKey}`,
      },
    });
    console.log('Ringover data', response.data);

    /**
     * Return the content with the response data as well
     * This will help us log content with variables replaced
     * in All Integrations
     */
    return [
      {
        ...response.data,
        content,
      },
      null,
    ];
  } catch (err) {
    logger.error(
      `Error occurred while sending Ringover sms: ${err.response?.status}`
    );
    switch (err.response?.status) {
      case RESPONSE_STATUS_CODE.UNAUTHORIZED:
        return [null, 'Invalid API Key'];
      case RESPONSE_STATUS_CODE.BAD_REQUEST:
        return [null, `Invalid destination phone number ${to_number}`];
      default:
        return [null, `Error while sending SMS with Ringover API`];
    }
  }
};

const getConversation = async (apiKey, conv_id) => {
  try {
    const axios = http(apiKey);
    const response = await axios.get(ROUTES.GET_CONVERSATION(conv_id));
    let { message_list } = response.data;
    message_list = message_list.reverse();
    return [{ ...response.data, message_list }, null];
  } catch (err) {
    logger.error(`Error while getting conversation`, err);
    return [null, err.message];
  }
};

const Message = {
  send,
  getConversation,
};

module.exports = Message;
