// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');

// Packages
const { QueryTypes } = require('sequelize');

// Repository
const Repository = require('../../repository');

const getLeadsListViewByRawQuery = async ({
  user_id,
  lead_query,
  account_query,
  replacements = {},
  limit_offset_query,
}) => {
  try {
    const curr_time = new Date().getTime();
    console.time('inside getLeadsListViewByRawQuery: ${curr_time}');
    let filter_query = `where 1=1 `;
    if (lead_query) filter_query += ` and ${lead_query} `;
    if (account_query) filter_query += ` and ${account_query}`;
    let query = `
with leads_to_use AS
(
select
 \`Lead\`.\`lead_id\`,
      \`Lead\`.\`first_name\`,
      \`Lead\`.\`last_name\`,
      \`Lead\`.\`duplicate\`,
      \`Lead\`.\`status\`,
      \`Lead\`.\`created_at\`,
      \`Lead\`.\`lead_score\`,
      \`Lead\`.\`lead_warmth\`,
      \`Lead\`.\`account_id\`,
       \`Account\`.\`account_id\` AS \`Account.account_id\`, 
  \`Account\`.\`name\` AS \`Account.name\`, 
  \`Account\`.\`size\` AS \`Account.size\` 
  from \`lead\` as \`Lead\`
  LEFT OUTER JOIN \`account\` AS \`Account\` ON \`Lead\`.\`account_id\` = \`Account\`.\`account_id\`
      ${filter_query}
    ORDER BY
      \`Lead\`.\`lead_id\` DESC
    ${limit_offset_query}
),
leads_to_use_with_all_info as
(
select
ltu.*,
  \`LeadToCadences\`.\`lead_cadence_id\` AS \`LeadToCadences.lead_cadence_id\`,
\`LeadToCadences\`.\`status\` AS \`LeadToCadences.status\`,
\`LeadToCadences->Tasks\`.\`task_id\` AS \`LeadToCadences.Tasks.task_id\`,
  \`LeadToCadences->Tasks->Node\`.\`node_id\` AS \`LeadToCadences.Tasks.Node.node_id\`, 
  \`LeadToCadences->Tasks->Node\`.\`type\` AS \`LeadToCadences.Tasks.Node.type\`, 
\`LeadToCadences->Tasks->Node\`.\`step_number\` AS \`LeadToCadences.Tasks.Node.step_number\`,
  \`LeadToCadences->Cadences\`.\`cadence_id\` AS \`LeadToCadences.Cadences.cadence_id\`, 
  \`LeadToCadences->Cadences\`.\`name\` AS \`LeadToCadences.Cadences.name\`, 
\`LeadToCadences->Cadences\`.\`status\` AS \`LeadToCadences.Cadences.status\`,
\`LeadToCadences->Cadences->Nodes\`.\`node_id\` AS \`LeadToCadences.Cadences.Nodes.node_id\`
from leads_to_use AS ltu
LEFT OUTER JOIN \`lead_to_cadence\` AS \`LeadToCadences\` ON \`ltu\`.\`lead_id\` = \`LeadToCadences\`.\`lead_id\`
LEFT OUTER JOIN \`account\` AS \`Account\` ON \`ltu\`.\`Account.account_id\` = \`Account\`.\`account_id\` 
LEFT OUTER JOIN \`task\` AS \`LeadToCadences->Tasks\` ON (
    \`LeadToCadences\`.\`cadence_id\` = \`LeadToCadences->Tasks\`.\`cadence_id\` 
    AND \`LeadToCadences\`.\`lead_id\` = \`LeadToCadences->Tasks\`.\`lead_id\` 
    AND \`LeadToCadences->Tasks\`.\`is_skipped\` = false 
    AND \`LeadToCadences->Tasks\`.\`completed\` = false 
    AND \`LeadToCadences->Tasks\`.\`node_id\` NOT IN (1, 2, 3, 4)
  ) 
LEFT OUTER JOIN \`node\` AS \`LeadToCadences->Tasks->Node\` ON \`LeadToCadences->Tasks\`.\`node_id\` = \`LeadToCadences->Tasks->Node\`.\`node_id\`
LEFT OUTER JOIN \`cadence\` AS \`LeadToCadences->Cadences\` ON \`LeadToCadences\`.\`cadence_id\` = \`LeadToCadences->Cadences\`.\`cadence_id\` 
LEFT OUTER JOIN \`node\` AS \`LeadToCadences->Cadences->Nodes\` ON \`LeadToCadences->Cadences\`.\`cadence_id\` = \`LeadToCadences->Cadences->Nodes\`.\`cadence_id\` 
),
activities_for_lead as
(
select
\`Activities\`.\`lead_id\` AS \`Activities.lead_id\`,
\`Activities\`.\`type\` AS \`Activities.type\`,
\`Activities\`.\`name\` AS \`Activities.name\`,
\`Activities\`.\`status\` AS \`Activities.status\`,
\`Activities\`.\`read\` AS \`Activities.read\`,
\`Activities\`.\`incoming\` AS \`Activities.incoming\`,
\`Activities\`.\`created_at\` AS \`Activities.created_at\` ,
 ROW_NUMBER () over(PARTITION by \`l.lead_id\` order by  \`created_at\` desc) as row_num
from
activity as \`Activities\`
inner join (select lead_id as \`l.lead_id\` from leads_to_use group by lead_id) as l
on Activities.lead_id = \`l.lead_id\`
),
latest_activity_for_lead as
(
select * from activities_for_lead where row_num = 1
)
select 
leads_to_use_with_all_info.*,
\`Activities.lead_id\`,
\`Activities.type\`,
\`Activities.name\`,
 \`Activities.status\`,
 \`Activities.read\`,
 \`Activities.incoming\`,
 \`Activities.created_at\` 
from leads_to_use_with_all_info left outer join latest_activity_for_lead on leads_to_use_with_all_info.lead_id = latest_activity_for_lead.\`Activities.lead_id\`
order by leads_to_use_with_all_info.lead_id desc
		`;
    let [data, err] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.LEAD],
      replacements: {
        user_id,
        ...replacements,
      },
      include: [
        {
          model: DB_MODELS[DB_TABLES.LEADTOCADENCE],
          include: [
            {
              model: DB_MODELS[DB_TABLES.TASK],
              include: [
                {
                  model: DB_MODELS[DB_TABLES.NODE],
                },
              ],
            },
            {
              model: DB_MODELS[DB_TABLES.CADENCE],
              include: [
                {
                  model: DB_MODELS[DB_TABLES.NODE],
                },
              ],
            },
          ],
        },
        {
          model: DB_MODELS[DB_TABLES.ACCOUNT],
        },
        {
          model: DB_MODELS[DB_TABLES.ACTIVITY],
        },
      ],
      extras: {
        mycustom: true,
        type: QueryTypes.SELECT,
        //returning: true,
        //logging: console.log,
      },
    });
    if (err) return [null, err];
    data = JSON.parse(JSON.stringify(data));
    //console.log(JSON.stringify(data, null, 4));
    console.timeEnd('inside getLeadsListViewByRawQuery: ${curr_time}');
    return [data, null];
  } catch (err) {
    logger.error(
      `Error while fetching leads for list view by raw query: `,
      err
    );
    return [null, err.message];
  }
};

//getLeadsListViewByRawQuery(7);

module.exports = getLeadsListViewByRawQuery;
