// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { QueryTypes } = require('sequelize');

// Helpers and Services
const Repository = require('../../repository');

const launchCadenceByRawQuery = async ({
  cadence_id,
  create_from_node_id,
  startTimeMap = {},
  metadataCreatedTimestamp = new Date().getTime(),
  t,
}) => {
  try {
    // TODO: remove once feature is stable
    console.log(
      JSON.stringify(
        {
          cadence_id,
          create_from_node_id,
          startTimeMap,
          metadataCreatedTimestamp,
        },
        null,
        4
      )
    );

    let startTimeConditions = ``;

    for (let user_id of Object.keys(startTimeMap)) {
      startTimeConditions += `when user_id='${user_id}' then ${
        startTimeMap?.[user_id] || new Date().getTime()
      }\n`;
    }

    let startTimeCase = `UNIX_TIMESTAMP(now())*1000 as start_time`;

    if (startTimeConditions)
      startTimeCase = `
case 
${startTimeConditions}
else UNIX_TIMESTAMP(now())*1000
end as start_time
		`;

    let metadata = {
      created_timestamp: metadataCreatedTimestamp,
    };
    //let metadata = `{'created_timestamp': ${metadataCreatedTimestamp}} as metadata`;

    let query = `

insert into task(name,start_time,metadata,to_show,urgent_time,lead_id,user_id,node_id,completed,is_skipped,cadence_id, status, created_at,updated_at)
with leads_to_use as
(
select 
l.lead_id ,
l.user_id,
ltc.unsubscribed ,
ltc.is_bounced ,
ums.semi_automatic_unsubscribed_data ,
bms.semi_automatic_bounced_data
from lead_to_cadence ltc
inner join \`lead\` l on l.lead_id = ltc.lead_id  
inner join settings s on s.user_id = l.user_id
inner join unsubscribe_mail_settings ums on ums.unsubscribe_settings_id = s.unsubscribe_settings_id 
inner join bounced_mail_settings bms on bms.bounced_settings_id  = s.bounced_settings_id 
where 
 ltc.cadence_id  = :cadence_id and ltc.status="not_started"
),
final_leads_to_use as
(
select 
*,
case 
	when json_extract(semi_automatic_bounced_data,"$.mail") = true then 1
	else 0
end as skip_for_mail_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.call") = true then 1
	else 0
end as skip_for_call_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.message") = true then 1
	else 0
end as skip_for_message_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.whatsapp") = true then 1
	else 0
end as skip_for_whatsapp_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.cadence_custom") = true then 1
	else 0
end as skip_for_cadence_custom_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.data_check") = true then 1
	else 0
end as skip_for_data_check_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.linkedin_connection") = true then 1
	else 0
end as skip_for_linkedin_connection_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.linkedin_message") = true then 1
	else 0
end as skip_for_linkedin_message_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.linkedin_profile") = true then 1
	else 0
end as skip_for_linkedin_profile_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.linkedin_interact") = true then 1
	else 0
end as skip_for_linkedin_interact_for_bounced,
case 
	when json_extract(semi_automatic_bounced_data,"$.callback") = true then 1
	else 0
end as skip_for_callback_for_bounced,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.mail") = true then 1
	else 0
end as skip_for_mail_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.call") = true then 1
	else 0
end as skip_for_call_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.message") = true then 1
	else 0
end as skip_for_message_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.whatsapp") = true then 1
	else 0
end as skip_for_whatsapp_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.cadence_custom") = true then 1
	else 0
end as skip_for_cadence_custom_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.data_check") = true then 1
	else 0
end as skip_for_data_check_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.linkedin_connection") = true then 1
	else 0
end as skip_for_linkedin_connection_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.linkedin_message") = true then 1
	else 0
end as skip_for_linkedin_message_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.linkedin_profile") = true then 1
	else 0
end as skip_for_linkedin_profile_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.linkedin_interact") = true then 1
	else 0
end as skip_for_linkedin_interact_for_unsubscribed,
case 
	when json_extract(semi_automatic_unsubscribed_data,"$.callback") = true then 1
	else 0
end as skip_for_callback_for_unsubscribed
from leads_to_use
),
create_from_node as 
 (
 select step_number from node where node_id = :create_from_node_id
 ),
nodes_to_use as 
(
select 
node_id,
type,
node.step_number,
data,
json_extract(data,"$.replied_node_id") as replied_node_id
from node 
 join create_from_node
 where
 node.cadence_id = :cadence_id and node.step_number >= create_from_node.step_number
),
pre_final_data as 
(
select 
case 
	when type in ("reply_to","automated_reply_to") and (not final_leads_to_use.user_id = task.user_id or task.is_skipped = 1)  then 1
	when is_bounced = 1 and type="mail" then skip_for_mail_for_bounced
	when is_bounced = 1 and type="automated_mail" then skip_for_mail_for_bounced
	when is_bounced = 1 and type="reply_to" then skip_for_mail_for_bounced
	when is_bounced = 1 and type="automated_reply" then skip_for_mail_for_bounced
	when is_bounced = 1 and type="call" then skip_for_call_for_bounced
	when is_bounced = 1 and type="message" then skip_for_message_for_bounced
	when is_bounced = 1 and type="automated_message" then skip_for_message_for_bounced
	when is_bounced = 1 and type="whatsapp" then skip_for_whatsapp_for_bounced
	when is_bounced = 1 and type="cadence_custom" then skip_for_cadence_custom_for_bounced
	when is_bounced = 1 and type="data_check" then skip_for_data_check_for_bounced
	when is_bounced = 1 and type="linkedin_message" then skip_for_linkedin_message_for_bounced
	when is_bounced = 1 and type="linkedin_connection" then skip_for_linkedin_connection_for_bounced
	when is_bounced = 1 and type="linkedin_profile" then skip_for_linkedin_profile_for_bounced
	when is_bounced = 1 and type="linkedin_interact" then skip_for_linkedin_interact_for_bounced
	when is_bounced = 1 and type="callback" then skip_for_callback_for_bounced
	when unsubscribed = 1 and type="mail" then skip_for_mail_for_unsubscribed
	when unsubscribed = 1 and type="automated_mail" then skip_for_mail_for_unsubscribed
	when unsubscribed = 1 and type="reply_to" then skip_for_mail_for_unsubscribed
	when unsubscribed = 1 and type="automated_reply_to" then skip_for_mail_for_unsubscribed
	when unsubscribed = 1 and type="call" then skip_for_call_for_unsubscribed
	when unsubscribed = 1 and type="message" then skip_for_message_for_unsubscribed
	when unsubscribed = 1 and type="automated_message" then skip_for_message_for_unsubscribed
	when unsubscribed = 1 and type="whatsapp" then skip_for_whatsapp_for_unsubscribed
	when unsubscribed = 1 and type="cadence_custom" then skip_for_cadence_custom_for_unsubscribed
	when unsubscribed = 1 and type="data_check" then skip_for_data_check_for_unsubscribed
	when unsubscribed = 1 and type="linkedin_message" then skip_for_linkedin_message_for_unsubscribed
	when unsubscribed = 1 and type="linkedin_connection" then skip_for_linkedin_connection_for_unsubscribed
	when unsubscribed = 1 and type="linkedin_profile" then skip_for_linkedin_profile_for_unsubscribed
	when unsubscribed = 1 and type="linkedin_interact" then skip_for_linkedin_interact_for_unsubscribed
	when unsubscribed = 1 and type="callback" then skip_for_callback_for_unsubscribed
	else 0
end as to_be_skipped,
nodes_to_use.*,
final_leads_to_use.*,
task.task_id as replied_task_id,
task.user_id as replied_task_user_id,
task.node_id as replied_task_node_id,
task.is_skipped as replied_task_is_skipped
-- ROW_NUMBER () over(PARTITION by final_leads_to_use.lead_id order by nodes_to_use.node_id) as row_num
from final_leads_to_use
join nodes_to_use
left outer join task on 
not nodes_to_use.replied_node_id is null and 
task.node_id = nodes_to_use.replied_node_id and 
task.lead_id = final_leads_to_use.lead_id
),
not_to_skip_tasks as 
(
select  
*,
ROW_NUMBER () over(PARTITION by pre_final_data.lead_id order by pre_final_data.step_number asc) as row_num 
from pre_final_data 
where to_be_skipped = 0
),
all_tasks as 
(
select 
pre_final_data.* 
from pre_final_data 
left outer join not_to_skip_tasks on pre_final_data.lead_id = not_to_skip_tasks.lead_id
join create_from_node
 where
 (not not_to_skip_tasks.node_id is null and pre_final_data.step_number >= create_from_node.step_number and pre_final_data.step_number <= not_to_skip_tasks.step_number and not_to_skip_tasks.row_num = 1) or  not_to_skip_tasks.node_id is null
--  pre_final_data.node_id >= :create_from_node_id and pre_final_data.node_id <= not_to_skip_tasks.node_id and
--  not_to_skip_tasks.row_num = 1
)
-- all_with_replied_tasks as 
-- (
-- select * from all_tasks left outer join task on not all_tasks.replied_node_id is null 
-- )
-- select * from all_tasks

select 
case 
	when type = "call" then 1
	when type = "message" then 2
	when type = "mail" then 3
	when type = "linkedin_connection" then 4
	when type = "linkedin_message" then 5
	when type = "linkedin_profile" then 6
	when type = "linkedin_interact" then 7
	when type = "data_check" then 8
	when type = "cadence_custom" then 9
	when type = "reply_to" then 10
	when type = "automated_mail" then 11
	when type = "automated_message" then 12
	when type = "done_tasks" then 13
	when type = "end" then 14
	when type = "automated_reply_to" then 15
	when type = "whatsapp" then 16
	when type = "callback" then 17
	else "default_name"
end as name,
${startTimeCase},
'${JSON.stringify(metadata)}' as metadata,
case 
	when type = "callback" then 0
	else 1
end as to_show,
123,
lead_id,
user_id,
node_id,
0 as completed,
to_be_skipped as is_skipped,
:cadence_id as cadence_id ,
case when to_be_skipped = 1 then 'skipped' else 'incomplete' end as status,
now(),
now()
from all_tasks
		`;
    // TODO: remove once feature is stable
    console.log('launchCadenceByRawQuery');
    console.log({
      cadence_id,
      create_from_node_id,
    });

    const [data, err] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.TASK],
      replacements: {
        cadence_id,
        create_from_node_id,
      },
      include: [],

      extras: {
        mycustom: true,
        type: QueryTypes.INSERT,
        returning: true,
      },
      t,
    });

    // TODO: remove once feature is stable
    console.log(data, err);
    return [data, null];
  } catch (err) {
    logger.error(`Error while launching cadence using raw query: `, err);
    return [null, err.message];
  }
};

module.exports = launchCadenceByRawQuery;
