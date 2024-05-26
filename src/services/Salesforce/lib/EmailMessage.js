const logger = require('../../../utils/winston');
const axios = require('axios');

const createSalesforceEmailMessage = async ({
  subject,
  email_body,
  from_address,
  to_address,
  bcc_address = '',
  cc_address = '',
  salesforce_lead_id,
  relationType = 'ToAddress',
  access_token,
  instance_url,
}) => {
  try {
    let body = {
      Subject: subject,
      HtmlBody: email_body,
      FromAddress: from_address,
      ToAddress: to_address,
      CcAddress: cc_address,
      BccAddress: bcc_address,
      Status: '3',
    };

    // Creating EmailMessage in salesforce
    let URL = `${instance_url}/services/data/v52.0/sobjects/EmailMessage`;
    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!response.data.success) {
      logger.error('Something went wrong while creating email message');
      console.log(response.data.errors);
      return [null, response.data.errors];
    }

    // Creating EmailMessageRelation in salesforce to link to an EmailMessage to a lead
    body = {
      EmailMessageId: response.data.id,
      RelationId: salesforce_lead_id,
      RelationType: relationType,
    };

    URL = `${instance_url}/services/data/v52.0/sobjects/EmailMessageRelation`;
    const linkResponse = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!linkResponse.data.success) {
      logger.error('Something went wrong while linking email message to lead');
      console.log(linkResponse.data.errors);
      return [null, linkResponse.data.errors];
    }

    logger.info('Email created in salesforce succesfully');

    return [response.data.id, null];
  } catch (err) {
    if (err.response) console.log(err.response.data);
    logger.error(
      `Error while creating email message in salesforce: ${err.message}`
    );
    return [null, err.message];
  }
};

module.exports = {
  createSalesforceEmailMessage,
};
