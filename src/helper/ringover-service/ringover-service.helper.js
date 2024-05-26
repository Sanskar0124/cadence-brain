// Utils
const logger = require('../../utils/winston');
const {
  MESSAGE_EVENT,
  ACTIVITY_TYPE,
  CALL_DIRECTION,
  LEAD_STATUS,
} = require('../../utils/enums');
// const {
//   sendActivity,
//   sendMessage,
//   sendNotification,
// } = require("../../utils/socket");

// Repositories
const StatusRepository = require('../../repository/status.repository');
const ConversationRepository = require('../../repository/conversation.repository');
const LeadRepository = require('../../repository/lead.repository');
const ActivityRepository = require('../../repository/activity.repository');
const UserRepository = require('../../repository/user-repository');

// Helpers and services
const getAvgTimeTillFirstCall = require('../lead/getAvgTimeFirstCall');
const redisHelper = require('../redis');
const activityHelper = require('../activity');
const PhoneNumberHelper = require('../phone-number');

const messageSentEvent = async (body, sendActivity) => {
  try {
    logger.info('Handling sent message event webhook...');
    console.log(JSON.stringify(body, null, 2));
    const { data } = body;
    const { user_id: ringover_user_id } = data;

    let [conv, errForConv] = await ConversationRepository.getConversation(
      data.conversation_id
    );
    if (errForConv) {
      logger.error(`Error while fetching conversation: ${errForConv}`);
      return [null, errForConv];
    }
    if (!conv) {
      logger.error(`No conversation found.`);
      return [null, 'No conversation found.'];
    }

    const lead_phone_number = data.to_number.replace(/[^0-9]/g, '');
    // get lead_id from redis
    let [redisValue, redisErr] = await redisHelper.getValue(
      `sms-${lead_phone_number}`
    );
    if (redisErr) return [null, redisErr];

    if (redisValue) redisValue = JSON.parse(redisValue);

    const { lead_id, node_id } = redisValue;

    if (!lead_id) {
      logger.error('Error in sms webhook: Could not find lead_id in redis');
      return [null, 'lead_id not found.'];
    }

    const [lead, errForLead] = await LeadRepository.getLeadByQuery({ lead_id });
    if (errForLead) return [null, errForLead];
    if (!lead) {
      logger.error('Error in sms webhook: Lead not found.');
      return [null, 'Lead not found.'];
    }

    if (lead.user_id !== conv.user_id) {
      logger.error('User id do not match.');
      return [null, 'User id do not match'];
    }

    // create activity
    const activity = {
      name: `Message sent to ${lead.first_name} ${lead.last_name}.`,
      type: ACTIVITY_TYPE.MESSAGE,
      status: data.body,
      lead_id: lead_id,
      cadence_id: conv.cadence_id,
      incoming: false,
      to_number: lead_phone_number,
      from_number: PhoneNumberHelper.formatPhoneNumber(data.from_number)[0],
      node_id: node_id ?? null,
    };

    const [createdActivity, errForCreateActivity] =
      await activityHelper.activityCreation(
        activity,
        lead.user_id,
        sendActivity
      );
    if (errForCreateActivity) return [null, 'Failed to create activity.'];

    logger.info('CREATED SMS SENT ACTIVITY');

    // remove cache from redis
    await redisHelper.removeValue(`sms-${data.to_number}`);

    const [toUpdate, errForUpdateContactTime] =
      await LeadRepository.updateContactTime(lead.lead_id, lead.user_id);
    if (toUpdate) {
      await StatusRepository.createStatus({
        lead_id: lead.lead_id,
        status: LEAD_STATUS.ONGOING,
        message: activity.name,
      });
    }
    return ['Activity created successfully for message event.', null];
  } catch (err) {
    logger.error('Error while handling message sent event: ', err);
    return [null, err.message];
  }
};

const messageReceivedEvent = async (body, sendActivity, sendNotification) => {
  try {
    logger.info('Handling received message event webhook...');
    console.log(JSON.stringify(body, null, 2));
    const { data } = body;
    const { user_id: ringover_user_id } = data;

    const user_phone_number = data.to_number;
    const lead_phone_number = data.from_number;

    // Fetch user
    const [user, errForUser] = await UserRepository.findUserByQuery({
      ringover_user_id,
    });
    if (errForUser || !user) {
      logger.error(`No user found with number ${user_phone_number}`);
      return [null, `No user found with number ${user_phone_number}`];
    }

    const DIGITS_TO_MATCH = 8;

    // Fetching the lead by user_id and phone_number
    let lead = null;
    let [leads, leadErr] = await LeadRepository.getLeadsByUserAndPhoneNumber(
      user.user_id,
      lead_phone_number.slice(-DIGITS_TO_MATCH)
    );
    if (leadErr) return [null, leadErr];
    if (!leads) {
      logger.info(`No lead found with the phone number: ${lead_phone_number}`);
      return badRequestResponse(
        res,
        `No lead found with the given phone number.`
      );
    }

    if (leads.length > 1) {
      logger.error(
        `Multiple leads found with phone number: ${lead_phone_number}`
      );
      return [null, 'Multiple leads found.'];
    } else {
      lead = leads[0];
    }

    // fetch conversation or create one
    const [convData, errForConv] = await ConversationRepository.findOrCreate({
      user_id: user.user_id,
      lead_id: lead.lead_id,
      from_phone_number: `+${parseInt(lead_phone_number)}`,
      conv_id: data.conversation_id,
      cadence_id: null,
    });
    if (errForConv) {
      logger.error(`Error while creating conversation: ${errForConv}`);
      return [null, 'Error while creating conversation.'];
    }
    let [conv, _] = convData;

    // create activity
    const activity = {
      name: `Message recieved from ${lead.first_name} ${lead.last_name}.`,
      type: ACTIVITY_TYPE.MESSAGE,
      status: data.body,
      lead_id: lead.lead_id,
      incoming: true,
      from_number: PhoneNumberHelper.formatPhoneNumber(data.from_number)[0],
      to_number: PhoneNumberHelper.formatPhoneNumber(data.to_number)[0],
    };

    const [createdActivity, errForCreatedActivity] =
      await activityHelper.activityCreation(
        activity,
        user.user_id,
        sendActivity
      );
    if (errForCreatedActivity) {
      logger.error(`Error while creating activity: ${errForCreatedActivity}`);
      return [null, 'Failed to create activity.'];
    }

    logger.info('CREATED SMS RECEIVED ACTIVITY ');

    // sendMessage({
    //   user_id: lead.user_id,
    //   message: body.data,
    // });
    sendNotification({
      type: ACTIVITY_TYPE.MESSAGE,
      user_id: lead.user_id,
      lead_id: conv.lead_id,
      title: `Message recieved`,
    });

    return ['Activity created successfully for received message event.', null];
  } catch (err) {
    logger.error('Error while handling message received event: ', err);
    return [null, err.message];
  }
};

const missedCallEvent = async (body, sendActivity, sendNotification) => {
  try {
    // console.log(body);
    logger.info('Handling missed call event...');
    const { data } = body;
    // logger.info('Finding lead by phone number...');

    // Check number in redis
    const redisNumber =
      data.direction === CALL_DIRECTION.INBOUND
        ? `${parseInt(data.to_number)}`
        : `${parseInt(data.from_number)}`;
    let [redisValue, redisErrForGet] = await redisHelper.getValue(
      `call-${redisNumber}`
    );
    if (redisValue === null) return;
    const lead_id = redisValue.replace('lead_id-', '');
    const [lead, errForLead] = await LeadRepository.getLeadByQuery({ lead_id });
    await redisHelper.removeValue(`call-${redisNumber}`);

    //const [phoneLead, errForPhoneLead] =
    //  await LeadPhoneNumberRepository.fetchLeadsByPhoneNumber({
    //    phone_number:
    //      data.direction === CALL_DIRECTION.INBOUND
    //        ? `+${parseInt(data.to_number)}`
    //        : `+${parseInt(data.from_number)}`,
    //  });
    //let lead = phoneLead.Lead;
    //const [lead, _] = await LeadRepository.findLeadByPhone(
    //  data.direction === CALL_DIRECTION.INBOUND
    //    ? `+${parseInt(data.to_number)}`
    //    : `+${parseInt(data.from_number)}`
    //);
    if (!lead) {
      return [null, 'No lead found.'];
    }
    // logger.info('Found lead.');
    // logger.info('Finding lead by ringover_user_id...');
    const [user, forUser] = await UserRepository.findUserByQuery({
      ringover_user_id: data.user_id.replace(/[^0-9]/g, ''),
    });
    if (!user) {
      logger.error(
        `No user found for ringover_user_id ${data.user_id.replace(
          /[^0-9]/g,
          ''
        )}`
      );
      return;
    }
    // logger.info('User found.');
    if (lead.user_id !== user.user_id) {
      logger.error(`User id does not match`);
      return [null, `User id does not match`];
    }
    // logger.info('User id matches.');
    // console.log('Lead and user->', lead, user);

    // IMP: Pass access token and instance url when you use it
    //if (
    //  lead.dataValues.salesforce_lead_id &&
    //  user.dataValues.salesforce_owner_id
    //) {
    //  try {
    //    await SalesforceEvents.createCallEvent(
    //      lead.dataValues.salesforce_lead_id ??
    //        lead.dataValues.salesforce_contact_id,
    //      user.dataValues.salesforce_owner_id,
    //      0,
    //      '',
    //      data.from_number, // from_number,
    //      data.direction === CALL_DIRECTION.INBOUND
    //        ? `${lead.first_name} ${lead.last_name}`
    //        : `${user.first_name} ${user.last_name}`, // from_name,
    //      data.to_number, // to_number,
    //      data.direction === CALL_DIRECTION.INBOUND
    //        ? `${user.first_name} ${user.last_name}`
    //        : `${lead.first_name} ${lead.last_name}` //to_name
    //    );
    //  } catch (e) {
    //    console.log(e);
    //  }
    //}

    const activity = {
      ringover_call_id: data.call_id,
      name:
        data.direction === CALL_DIRECTION.INBOUND
          ? `Missed call from ${lead.first_name} ${lead.last_name}`
          : `${lead.first_name} ${lead.last_name} didn't answered the call.`,
      type: ACTIVITY_TYPE.CALL,
      status: `Missed call, Rang for ${parseInt(
        data.hangup_time - data.start_time
      )} seconds.`,
      lead_id: lead.lead_id,
      incoming: data.direction === CALL_DIRECTION.INBOUND ? true : false,
    };
    const [createdActivity, err] = await ActivityRepository.createActivity(
      activity
    );
    if (err)
      logger.error(
        'Error occured while creating activity:- ' +
          JSON.stringify(activity, null, 2)
      );
    // logger.info('Successfully created actitvity:- ');
    logger.info(JSON.stringify(createdActivity, null, 2));
    sendActivity({
      activity: JSON.parse(JSON.stringify(createdActivity)),
      email: user.email,
    }); // will send through socket
    sendNotification({
      type: 'missed_call',
      user_id: user.user_id,
      lead_id: lead.lead_id,
      title:
        data.direction === CALL_DIRECTION.INBOUND
          ? `Missed call`
          : `Call not answered`,
    });
    logger.info('Handled missed call event successfully.');
    const [toUpdate, errForUpdateContactTime] =
      await LeadRepository.updateContactTime(lead.lead_id, lead.user_id);
    if (toUpdate) {
      await StatusRepository.createStatus({
        lead_id: lead.lead_id,
        status: LEAD_STATUS.ONGOING,
        message: activity.name,
      });
    }
    return ['Created actitvity successfully for call event.', null];
  } catch (err) {
    logger.error('Error while handling missed call event:- ', err);
    return [null, err];
  }
};

const hangupCallEvent = async (body, sendActivity, sendNotification) => {
  try {
    // console.log(body);
    logger.info('Handling hangup call event...');
    const { data } = body;
    // logger.info('Finding lead by phone number...');
    //

    // Check number in redis
    const redisNumber =
      data.direction === CALL_DIRECTION.INBOUND
        ? `${parseInt(data.from_number)}`
        : `${parseInt(data.to_number)}`;
    let [redisValue, redisErrForGet] = await redisHelper.getValue(
      `call-${redisNumber}`
    );
    if (redisValue === null) return;
    const lead_id = redisValue.replace('lead_id-', '');
    const [lead, errForLead] = await LeadRepository.getLeadByQuery({ lead_id });
    await redisHelper.removeValue(`call-${redisNumber}`);

    //const [phoneLead, errForPhoneLead] =
    //  await LeadPhoneNumberRepository.fetchLeadsByPhoneNumber({
    //    phone_number:
    //      data.direction === CALL_DIRECTION.INBOUND
    //        ? `+${parseInt(data.from_number)}`
    //        : `+${parseInt(data.to_number)}`,
    //  });

    //let lead = phoneLead[0].dataValues.Lead.dataValues;

    //const [lead, _] = await LeadRepository.findLeadByPhone(
    //  data.direction === CALL_DIRECTION.INBOUND
    //    ? `+${parseInt(data.from_number)}`
    //    : `+${parseInt(data.to_number)}`
    //);

    if (!lead) {
      return [null, 'No lead found.'];
    }
    logger.info('Found lead.');

    /**
     * ! TODO: calculate 'avg_time_till_first_call' and update it
     * * Update only if no call activity present
     */

    // * Fetching call activity
    let [foundCallActivity, __] = await ActivityRepository.getActivitiesByQuery(
      {
        lead_id: lead.lead_id,
        type: ACTIVITY_TYPE.CALL,
      }
    );

    if (foundCallActivity === null) {
      logger.info('This is the first time the lead has been called...');
      let [timeTillFirstCall, ___] = await getAvgTimeTillFirstCall(lead);
      if (timeTillFirstCall !== null) {
        await LeadRepository.updateLeads(lead, {
          avg_time_till_first_call: timeTillFirstCall,
        });
        logger.info(
          'Successfully updated avg_time_till_first_call: ' + timeTillFirstCall
        );
      } else {
        logger.error(
          'An error occured while trying to update time till first call'
        );
      }
    }

    // logger.info('Finding user by ringover_user_id...');
    const [user, forUser] = await UserRepository.findUserByQuery({
      ringover_user_id: data.user_id.toString().replace(/[^0-9]/g, ''),
    });
    if (!user) {
      logger.error(
        `No user found for ringover_user_id ${data.user_id
          .toString()
          .replace(/[^0-9]/g, '')}`
      );
      return;
    }
    // logger.info('User found.');
    if (lead.user_id !== user.user_id) {
      logger.error(`User id does not match`);
      return [null, `User id does not match`];
    }
    // logger.info('User id matches.');

    let activity = {
      ringover_call_id: data.call_id,
      name: `You spoke with ${lead.first_name} ${lead.last_name}`,
      type: ACTIVITY_TYPE.CALL,
      status: `For ${parseInt(data.duration_in_seconds)} seconds`,
      recording: data.record, // url for call recording
      lead_id: lead.lead_id,
      incoming: data.direction === CALL_DIRECTION.INBOUND ? true : false,
    };

    // IMP: Pass access token and instance url when you use it
    //const [salesforce_task_id, salesforceError] =
    //  await SalesforceEvents.createCallEvent(
    //    lead.salesforce_lead_id ?? lead.salesforce_contact_id,
    //    user.salesforce_owner_id,
    //    data.duration_in_seconds,
    //    data.record,
    //    data.from_number, // from_number,
    //    data.direction === CALL_DIRECTION.INBOUND
    //      ? `${lead.first_name} ${lead.last_name}`
    //      : `${user.first_name} ${user.last_name}`, // from_name,
    //    data.to_number, // to_number,
    //    data.direction === CALL_DIRECTION.INBOUND
    //      ? `${user.first_name} ${user.last_name}`
    //      : `${lead.first_name} ${lead.last_name}` //to_name
    //  );
    //if (salesforceError) {
    //  logger.info(
    //    'Error creating salesforce task -> ',
    //    salesforceError.message
    //  );
    //}

    //if (salesforce_task_id) {
    //  activity.salesforce_task_id = salesforce_task_id;
    //}

    const [createdActivity, err] = await ActivityRepository.createActivity(
      activity
    );
    if (err)
      logger.error(
        'Error occured while creating activity:- ' +
          JSON.stringify(activity, null, 2)
      );
    // logger.info('Successfully created actitvity:- ');
    // logger.info(JSON.stringify(createdActivity, null, 2));
    sendActivity({
      activity: JSON.parse(JSON.stringify(createdActivity)),
      email: user.email,
    }); // will send through socket
    sendNotification({
      type: 'missed_call',
      lead_id: lead.lead_id,
      user_id: user.user_id,
      title: 'Call ended',
    });
    logger.info('Handled hangup call event successfully.');
    const [toUpdate, errForUpdateContactTime] =
      await LeadRepository.updateContactTime(lead.lead_id, lead.user_id);
    if (toUpdate) {
      await StatusRepository.createStatus({
        lead_id: lead.lead_id,
        status: LEAD_STATUS.ONGOING,
        message: activity.name,
      });
    }
    return ['Created actitvity successfully for hangup call event.', null];
  } catch (err) {
    logger.error('Error while handlindg hangup call event:- ', err);
    return [null, err.message];
  }
};

const afterCallEvent = async (body, sendActivity) => {
  try {
    logger.info('Handling after call event...');
    // logger.info('Body:- ' + JSON.stringify(body, null, 4));
    const { data } = body;
    let updatedActivity = {};
    updatedActivity['ringover_call_id'] = data.call_id;

    const [activity, errActivity] =
      await ActivityRepository.getActivityByRingoverCallId(data.call_id);

    // const [activity, errActivity] =
    //   await ActivityRepository.getActivityByRingoverCallId(data.call_id);

    if (data['comments']) {
      // saving if comment present
      updatedActivity['comment'] = data.comments;
      //if (activity)
      // IMP: Pass access token and instance url when you use it
      //  if (activity.salesforce_task_id !== null) {
      //    try {
      //      await SalesforceEvents.updateCallEvent(
      //        activity.salesforce_task_id,
      //        {
      //          note: data.comments,
      //        }
      //      );
      //    } catch (e) {
      //      console.log(e);
      //    }
      //  }
    } else if (data['voicemail_link']) {
      // saving if voicemail present
      updatedActivity['voicemail'] = data.voicemail_link;
      //if (activity)
      // IMP: Pass access token and instance url when you use it
      //  if (activity.salesforce_task_id !== null) {
      //    try {
      //      await SalesforceEvents.updateCallEvent(
      //        activity.salesforce_task_id,
      //        {
      //          voicemail_link: data.voicemail_link,
      //        }
      //      );
      //    } catch (e) {
      //      console.log(e);
      //    }
      //  }
    }

    // logger.info(
    //   'Activity to update:- ' + JSON.stringify(updatedActivity, null, 4)
    // );
    const [activityResult, err] = await ActivityRepository.updateActivity(
      updatedActivity,
      {
        ringover_call_id: updatedActivity.ringover_call_id,
      }
    );
    if (err) {
      logger.error(
        `Error while updating activity with id ${updatedActivity.activity_id}.`
      );
      return [
        null,
        `Error while updating activity with id ${updatedActivity.activity_id}.`,
      ];
    }
    // logger.info(`Updated activity.`);

    const [activtiy, errForActivity] =
      await ActivityRepository.getActivityByRingoverCallId(
        updatedActivity.ringover_call_id
      );

    if (errForActivity) {
      return [null, errForActivity];
    }

    const [lead, errForLead] = await LeadRepository.getLeadByQuery({
      lead_id: activity.lead_id,
    });

    if (errForLead) {
      return [null, errForLead];
    }

    const [user, errForUser] = await UserRepository.findUserByQuery({
      user_id: lead.user_id,
    });

    if (errForUser) {
      return [null, errForUser];
    }

    sendActivity({
      activity: JSON.parse(JSON.stringify(activtiy)),
      email: user.email,
    }); // will send through socket

    logger.info('Hanlded after call event successfully.');
    return ['Hanlded after call event successfully.', null];
  } catch (err) {
    logger.error('Error while handling after call event:- ', err);
    return [null, err.message];
  }
};

const RingoverService = {
  messageSentEvent,
  messageReceivedEvent,
  missedCallEvent,
  hangupCallEvent,
  afterCallEvent,
};

module.exports = RingoverService;
