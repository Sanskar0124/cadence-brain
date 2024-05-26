const logger = require('../../../utils/winston');
const client = require('./setup');

const sendReply = async ({
  token,
  to,
  cc,
  bcc,
  from,
  subject,
  body,
  lead,
  attachments,
  cadence_id,
  node_id,
  email_template_id,
  ab_template_id,
  replied_node_id,
}) => {
  try {
    token = JSON.stringify(token);
    from = JSON.stringify(from);
    lead = JSON.stringify(lead);
    const data = await client.sendReply({
      integration_type: 'google',
      token,
      to,
      cc,
      bcc,
      from,
      subject,
      body,
      lead,
      attachments,
      cadence_id,
      node_id,
      email_template_id,
      ab_template_id,
      replied_node_id,
    });
    if (!data.success) return [null, data.msg];
    return [data, null];
  } catch (err) {
    logger.error('Error while sending mail: ', err);
    console.log('Stack Trace sendReply.js: ', err);
    return [null, err.message];
  }
};

module.exports = sendReply;
