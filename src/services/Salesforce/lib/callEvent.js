const axios = require('axios');
const logger = require('../../../utils/winston');

const createCallEvent = async (
  salesforce_lead_id,
  salesforce_owner_id,
  duration = 0,
  recording = '',
  from_number,
  from_name,
  to_number,
  to_name,
  access_token,
  instance_url
) => {
  try {
    let body = {
      WhoId: salesforce_lead_id,
      Subject: `Call: Appel sortant de ${from_number} (${from_name}) vers ${to_number} (${to_name})`,
      ActivityDate: new Date(),
      Status: 'Completed',
      Priority: 'Normal',
      OwnerId: salesforce_owner_id,
      Description: 'Made a call',
      TaskSubtype: 'Call',
      Status: 'Missed Call',
    };
    if (duration !== 0) {
      body.CallDurationInSeconds = duration;
      body.Status = 'Completed';
      body.Description = `Audio link: ${recording}`;
    }

    const URL = `${instance_url}/services/data/v52.0/sobjects/Task`;
    const response = await axios.post(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.success) {
      logger.info('Salesforce call event created successfully');
      console.log(response.data);
      return [response.data.id, null];
    }
    logger.info('Salesforce call event creation failed');
    console.log(response.data.errors);
    return [false, response.data.errors];
  } catch (err) {
    logger.error(`Error while creating salesforce call event: ${err.message}`);
    return [null, err];
  }
};

const updateCallEvent = async (
  salesforce_task_id,
  info,
  access_token,
  instance_url
) => {
  try {
    console.log('Update call event: ', salesforce_task_id, info);
    const URL = `${instance_url}/services/data/v52.0/sobjects/Task/${salesforce_task_id}`;
    const taskResponse = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    let body = {};
    if (
      info.note &&
      !new RegExp('\\b' + 'Note' + '\\b').test(taskResponse.data.Description)
    ) {
      body.Description = `Note: ${info.note} ` + taskResponse.data.Description;
    }
    if (info.voicemail_link) {
      body.Description =
        taskResponse.data.Description + `Audio link: ${info.voicemail_link}`;
    }

    const response = await axios.patch(URL, body, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (response.data.success) {
      logger.info('Salesforce call event updated successfully');
      console.log(response.data);
      return [response.data.id, null];
    }
    logger.info('Salesforce call event updation failed');
    console.log(response.data.errors);
    return [false, response.data.errors];
  } catch (err) {
    logger.error(err);
    console.log(err);
    return [null, err];
  }
};

module.exports = { createCallEvent, updateCallEvent };
