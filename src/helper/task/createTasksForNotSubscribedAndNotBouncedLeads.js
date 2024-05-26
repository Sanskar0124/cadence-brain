// Utils
const logger = require('../../utils/winston');

const { QueryTypes } = require('sequelize');

// Repository
const Repository = require('../../repository');
const { DB_TABLES, DB_MODELS } = require('../../utils/modelEnums');

const TASK_CREATION_TYPE = {
  ALL: 'all',
  UNSUBSCRIBED: 'unsubscribed',
  BOUNCED: 'bounced',
};

const createTasksForNotSubscribedAndNotBouncedLeads = async ({
  node_id_to_create,
  node_id_to_select,
  name,
  cadence_id,
  timezonesMap, // start time will be taken from this
  lateTimesMap, // late time will be taken from this
  usersMap,
  create_types,
}) => {
  try {
    let startTimeConditions = ``;
    let lateTimeConditions = ``;
    let isSkippedConditions = ``;
    let skipTimeConditions = ``;

    let unsubscribedUserIds = [];
    let bouncedUserIds = [];
    let notUnsubscribedNorBouncedUserIds = [];
    let userIds = [];

    for (let user_id of Object.keys(usersMap)) {
      userIds.push(user_id);
      startTimeConditions += `when user_id='${user_id}' then ${
        usersMap?.[user_id]?.start_time || new Date().getTime()
      }\n`;
      lateTimeConditions += `when user_id='${user_id}' then ${
        usersMap?.[user_id]?.late_time || new Date().getTime()
      }\n`;
      let skip_for_unsubscribe = usersMap[user_id].skip_for_unsubscribe;
      let skip_for_bounced = usersMap[user_id].skip_for_bounced;
      // skip for unsubscribed leads
      if (skip_for_unsubscribe) {
        unsubscribedUserIds.push(user_id);
        isSkippedConditions += `when user_id='${user_id}' and unsubscribed=1 then ${
          usersMap?.[user_id]?.to_be_skipped || null
        }\n`;
        skipTimeConditions += `when user_id='${user_id}' and unsubscribed=1 then ${
          usersMap?.[user_id]?.to_be_skipped ? new Date().getTime() : null
        }\n`;
      }
      // skip for bounced leads
      if (skip_for_bounced) {
        bouncedUserIds.push(user_id);
        isSkippedConditions += `when user_id='${user_id}' and is_bounced=1 then ${
          usersMap?.[user_id]?.to_be_skipped || null
        }\n`;
        skipTimeConditions += `when user_id='${user_id}' and is_bounced=1 then ${
          usersMap?.[user_id]?.to_be_skipped ? new Date().getTime() : null
        }\n`;
      }
      if (!skip_for_unsubscribe && !skip_for_bounced) {
        isSkippedConditions += `when user_id='${user_id}' then ${
          usersMap?.[user_id]?.to_be_skipped || null
        }\n`;
        skipTimeConditions += `when user_id='${user_id}'  then ${
          usersMap?.[user_id]?.to_be_skipped ? new Date().getTime() : null
        }\n`;
      }
      // skip for both unsubscribed and bounced leads
      //else {
      //isSkippedConditions += `when user_id='${user_id}' and (unsubscribed=1 or is_bounced=1) then ${
      //usersMap?.[user_id]?.to_be_skipped || null
      //}\n`;
      //skipTimeConditions += `when user_id='${user_id}' and (unsubscribed=1 or is_bounced=1) then ${
      //usersMap?.[user_id]?.to_be_skipped ? new Date().getTime() : null
      //}\n`;
      //}
      // skip for neither unsubscribed nor bounced
      //else {
      //notUnsubscribedNorBouncedUserIds.push(user_id);
      //isSkippedConditions += `when user_id='${user_id}' then ${
      //usersMap?.[user_id]?.to_be_skipped || null
      //}\n`;
      //skipTimeConditions += `when user_id='${user_id}' then ${
      //usersMap?.[user_id]?.to_be_skipped ? new Date().getTime() : null
      //}\n`;
      //}
    }

    //for (let timezone of Object.keys(timezonesMap))
    //startTimeConditions += `when timezone='${timezone}' then ${timezonesMap[timezone]}\n`;
    //for (let user_id of Object.keys(lateTimesMap))
    //startTimeConditions += `when user_id='${user_id}' then ${lateTimesMap[user_id]}\n`;

    let startTimeCase = `
case 
${startTimeConditions}
end as start_time
		`;
    let lateTimeCase = `
case 
${lateTimeConditions}
end as late_time
		`;
    let isSkippedCase = `
case 
${isSkippedConditions}
end as is_skipped
		`;
    let skipTimeCase = `
case 
${skipTimeConditions}
end as skip_time
		`;
    let notUnsubscribedNorBouncedQuery = `
insert into task(name,completed ,is_skipped ,start_time,late_time,skip_time,urgent_time,lead_id,user_id,node_id,cadence_id,created_at,updated_at)
with tasks_temp as
(
select 
t.*,
u.timezone,
ltc.lead_cadence_id ,
ltc.unsubscribed,
ltc.is_bounced
from 
task t 
inner join user u on t.user_id = u.user_id
inner join \`lead\` l on l.lead_id = t.lead_id 
inner join lead_to_cadence ltc on ltc.cadence_id  = :cadence_id and t.lead_id = ltc.lead_id
where 
t.node_id = :node_id_to_select and (ltc.unsubscribed is NULL or ltc.unsubscribed = 0) and (ltc.is_bounced  is NULL or ltc.is_bounced = 0) and t.user_id in (:userIds)
)
select 
"Script" as name,
0 as completed ,
0 as is_skipped,
${startTimeCase},
${lateTimeCase},
NULL as skip_time,
UNIX_TIMESTAMP(CONCAT(DATE(NOW()), ' ', CURTIME(3))) as urgent_time,
tt.lead_id,
tt.user_id,
:node_id_to_create as node_id,
tt.cadence_id,
now() as created_at,
now() as updated_at 
from tasks_temp as tt

		`;

    let unsubscribedQuery = `
insert into task(name,completed ,is_skipped ,start_time,late_time,skip_time,urgent_time,lead_id,user_id,node_id,cadence_id,created_at,updated_at)
with tasks_temp as
(
select 
t.*,
u.timezone,
ltc.lead_cadence_id ,
ltc.unsubscribed,
ltc.is_bounced
from 
task t 
inner join user u on t.user_id = u.user_id
inner join \`lead\` l on l.lead_id = t.lead_id 
inner join lead_to_cadence ltc on ltc.cadence_id  = :cadence_id and t.lead_id = ltc.lead_id
where 
t.node_id = :node_id_to_select and ltc.unsubscribed = 1 and t.user_id in (:userIds)
)
select 
"Script" as name,
0 as completed ,
${isSkippedCase},
${startTimeCase},
${lateTimeCase},
${skipTimeCase},
UNIX_TIMESTAMP(CONCAT(DATE(NOW()), ' ', CURTIME(3))) as urgent_time,
tt.lead_id,
tt.user_id,
:node_id_to_create as node_id,
tt.cadence_id,
now() as created_at,
now() as updated_at 
from tasks_temp as tt

		`;

    let bouncedQuery = `
insert into task(name,completed ,is_skipped ,start_time,late_time,skip_time,urgent_time,lead_id,user_id,node_id,cadence_id,created_at,updated_at)
with tasks_temp as
(
select 
t.*,
u.timezone,
ltc.lead_cadence_id ,
ltc.unsubscribed,
ltc.is_bounced
from 
task t 
inner join user u on t.user_id = u.user_id
inner join \`lead\` l on l.lead_id = t.lead_id 
inner join lead_to_cadence ltc on ltc.cadence_id  = :cadence_id and t.lead_id = ltc.lead_id
where 
t.node_id = :node_id_to_select and ltc.is_bounced = 1 and t.user_id in (:userIds)
)
select 
"Script" as name,
0 as completed ,
${isSkippedCase},
${startTimeCase},
${lateTimeCase},
${skipTimeCase},
UNIX_TIMESTAMP(CONCAT(DATE(NOW()), ' ', CURTIME(3))) as urgent_time,
tt.lead_id,
tt.user_id,
:node_id_to_create as node_id,
tt.cadence_id,
now() as created_at,
now() as updated_at 
from tasks_temp as tt

		`;

    //query = `insert into task(name,completed ,is_skipped ,start_time,late_time,urgent_time,lead_id,user_id,node_id,cadence_id,created_at,updated_at) values('test',0,0,90000,90000,90000,101,10,102,1,now(),now())`;
    if (create_types.includes(TASK_CREATION_TYPE.ALL)) {
      const [
        notUnsubscribedNorBouncedData,
        errForNotUnsubscribedNorBouncedData,
      ] = await Repository.runRawQuery({
        rawQuery: notUnsubscribedNorBouncedQuery,
        tableName: DB_MODELS[DB_TABLES.TASK],
        replacements: {
          node_id_to_create,
          node_id_to_select,
          cadence_id,
          notUnsubscribedNorBouncedUserIds,
          userIds,
        },
        include: [],
        extras: {
          mycustom: true,
          type: QueryTypes.INSERT,
          returning: true,
        },
      });
      // TODO: remove once feature is stable
      console.log('notUnsubscribedNorBouncedData');
      console.log(
        notUnsubscribedNorBouncedData,
        errForNotUnsubscribedNorBouncedData
      );
    }

    if (
      create_types.includes(TASK_CREATION_TYPE.ALL) ||
      create_types.includes(TASK_CREATION_TYPE.UNSUBSCRIBED)
    ) {
      const [unsubscribedData, errForUnsubscribedData] =
        await Repository.runRawQuery({
          rawQuery: unsubscribedQuery,
          tableName: DB_MODELS[DB_TABLES.TASK],
          replacements: {
            node_id_to_create,
            node_id_to_select,
            cadence_id,
            unsubscribedUserIds,
            userIds,
          },
          include: [],
          extras: {
            mycustom: true,
            type: QueryTypes.INSERT,
            returning: true,
          },
        });
      // TODO: remove once feature is stable
      console.log('unsubscribedData');
      console.log(unsubscribedData, errForUnsubscribedData);
    }

    if (
      create_types.includes(TASK_CREATION_TYPE.ALL) ||
      create_types.includes(TASK_CREATION_TYPE.BOUNCED)
    ) {
      const [bouncedData, errForBouncedData] = await Repository.runRawQuery({
        rawQuery: bouncedQuery,
        tableName: DB_MODELS[DB_TABLES.TASK],
        replacements: {
          node_id_to_create,
          node_id_to_select,
          cadence_id,
          bouncedUserIds,
          userIds,
        },
        include: [],
        extras: {
          mycustom: true,
          type: QueryTypes.INSERT,
          returning: true,
        },
      });
      // TODO: remove once feature is stable
      console.log('bouncedData');
      console.log(bouncedData, errForBouncedData);
    }
  } catch (err) {
    logger.error(`Error while creating tasks for leads using raw sql: `, err);
    return [null, err.message];
  }
};

//createTasksForNotSubscribedAndNotBouncedLeads({
//node_id: 101,
//name: 'Script',
//cadence_id: 1,
//timezonesMap: {
//'Asia/Kolkata': 1675416525679,
//'Europe/Paris': 1675416525706,
//},
//lateTimesMap: { 1: 1675502925679, 2: 1675502925667, 3: 1675502925706 },
//});

module.exports = createTasksForNotSubscribedAndNotBouncedLeads;
