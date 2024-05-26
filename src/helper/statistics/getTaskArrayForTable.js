// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');
const { LEADERBOARD_DATE_FILTERS } = require('../../utils/enums');

// Packages

// Repository
const Repository = require('../../repository');

const getTaskArrayForTable = async ({
  company_id,
  start_time,
  end_time,
  cadence_id = false,
  user_id = false,
}) => {
  try {
    let filter_query = ` 
    
        WHERE  ( ( \`task\`.\`complete_time\` BETWEEN ${start_time} AND ${end_time}
            AND \`task\`.\`completed\` = true )
        OR ( \`task\`.\`skip_time\` BETWEEN ${start_time} AND ${end_time}
            AND \`task\`.\`is_skipped\` = true ) )
        AND \`task\`.\`user_id\` IS NOT NULL
        AND \`task\`.\`cadence_id\` IS NOT NULL
        AND \`task\`.\`node_id\` NOT IN ( 1, 2, 3, 4,
                                    5, 6 )
      `;
    if (cadence_id) {
      if (Array.isArray(cadence_id))
        filter_query += ` and \`task\`.\`cadence_id\` IN  (${cadence_id?.join(
          ','
        )}) `;
      else filter_query += `and \`task\`.\`cadence_id\` = ${cadence_id} `;
    }

    if (user_id) {
      if (Array.isArray(user_id)) {
        const formattedIds = user_id.map((id) => `'${id}'`).join(',');
        filter_query += ` and \`task\`.\`user_id\` IN (${formattedIds}) `;
      } else {
        filter_query += `and \`task\`.\`user_id\` = '${user_id}' `;
      }
    }

    const query = `with task_count as (
        SELECT 
        Count( 
            CASE
                                     WHEN complete_time BETWEEN
                                          ${start_time} AND ${end_time}
                                          AND completed = 1
                                          AND node.type NOT IN (
                                              "automated_mail", "automated_message",
                                              "automated_reply_to" ) THEN task_id
                                     ELSE NULL
                                   end
            )                              
            AS
           \`completed_task_count\`,
           Count( CASE
                                     WHEN skip_time BETWEEN ${start_time} AND
                                                            ${end_time}
                                          AND is_skipped = 1
                                          AND node.type NOT IN (
                                              "automated_mail", "automated_message",
                                              "automated_reply_to" ) THEN task_id
                                     ELSE NULL
                                   end)                              AS
           \`skipped_task_count\`,
           Count( CASE
                                     WHEN complete_time BETWEEN
                                          ${start_time} AND ${end_time}
                                          AND completed = 1
                                          AND node.type IN ( "automated_mail",
                                                             "automated_message",
                                                             "automated_reply_to" )
                                   THEN task_id
                                     ELSE NULL
                                   end)                              AS
           \`automated_task_count\`,

    
            \`node\`.\`type\`                                           AS node_type,
            \`task\`.\`lead_id\`                                        AS lead_id,
            \`cadence\`.\`cadence_id\`                                  AS cadence_id,
            \`user\`.\`user_id\`                                        AS user_id
    
    
        FROM   \`task\` AS \`Task\`
    
    
        INNER JOIN \`user\` AS \`User\`
                   ON \`task\`.\`user_id\` = \`user\`.\`user_id\`
                      AND \`user\`.\`company_id\` =
                          '${company_id}'
    
        INNER JOIN \`cadence\` AS \`Cadence\`
                   ON \`task\`.\`cadence_id\` = \`cadence\`.\`cadence_id\`
        INNER JOIN \`node\` AS \`Node\`
                   ON \`task\`.\`node_id\` = \`node\`.\`node_id\`
        
    
    
    ${filter_query}
    
    GROUP  BY \`node\`.\`type\`,
              \`task\`.\`user_id\`,
              \`task\`.\`cadence_id\`
    
    ),
    
    unique_cadences as (
            select 
                cadence.name as name,
                cadence.cadence_id as cadence_id
                from task_count
                inner join cadence on cadence.cadence_id = task_count.cadence_id
                group by task_count.cadence_id
    ),
    
    unique_cadences_with_node as (
        select
            unique_cadences.cadence_id as cadence_id, 
            node.node_id as node_id
            from unique_cadences
            inner join node on node.cadence_id = unique_cadences.cadence_id
            group by unique_cadences.cadence_id, node.node_id
    ),
    
    cadence_nodes_count as (
        select
            cadence_id,
            count(node_id) as total_nodes
        from unique_cadences_with_node
        group by cadence_id
    ),
    
    final_cadence_data as (
        select 
            unique_cadences.name as name,
            unique_cadences.cadence_id as cadence_id,
            nodes_count.total_nodes
        from unique_cadences
        left join cadence_nodes_count nodes_count on unique_cadences.cadence_id = nodes_count.cadence_id
    ),
    
    unique_users as (
        select 
                user.first_name as first_name,
                user.last_name as last_name,
                user.sd_id as sd_id,
                user.is_profile_picture_present as is_profile_picture_present,
                user.user_id as user_id
        from task_count
        inner join user on user.user_id = task_count.user_id
        group by task_count.user_id
    ),
    ltc_rows as (
        select 
            unique_cadences.cadence_id as cadence_id,
            unique_users.user_id as user_id, 
            lead_to_cadence.\`lead_cadence_id\` as ltc_id
        from unique_cadences
        inner join lead_to_cadence on lead_to_cadence.\`cadence_id\` = unique_cadences.cadence_id
        inner join \`lead\` on lead_to_cadence.lead_id = \`lead\`.\`lead_id\`
        inner join unique_users on unique_users.user_id = \`lead\`.\`user_id\`
        group by cadence_id, ltc_id, user_id
    ),
    
    ltc_count as (
        select 
            cadence_id,
            user_id,
            count(ltc_id) as total_leads
        from ltc_rows
        group by cadence_id, user_id
    ),
    
    unique_users_with_sd as (
            select 
            unique_users.* ,
            sd.name as sd_name
            from unique_users
            inner join sub_department as sd on unique_users.sd_id = sd.sd_id
           
    ),
    
    final_data as (
      SELECT 
           task_count.\`completed_task_count\`,
           task_count.\`skipped_task_count\`,
           task_count.\`automated_task_count\`,
           0 as \`pending_task_count\`,
           0 as \`active_lead_count\`,
           task_count.\`node_type\`,
           user_data.\`first_name\`,
           user_data.\`last_name\`,
           user_data.\`sd_id\`,
           user_data.\`is_profile_picture_present\`,
           user_data.\`user_id\` AS user_id,
           user_data.\`sd_name\`,
           cadence_data.\`name\` AS cadence_name,
           cadence_data.\`cadence_id\` AS cadence_id,
           cadence_data.\`total_nodes\`,
           ltc_count.\`total_leads\`
       FROM task_count 
       left join unique_users_with_sd user_data on user_data.user_id = task_count.user_id
       left join final_cadence_data cadence_data on cadence_data.cadence_id = task_count.cadence_id 
       left join ltc_count on ltc_count.cadence_id = task_count.cadence_id and ltc_count.user_id = task_count.user_id
       )
              
        SELECT * FROM final_data;
        `;
    let [data, err] = await Repository.runRawQuery({
      rawQuery: query,
      tableName: DB_MODELS[DB_TABLES.LEAD],
      replacements: {},
      extras: {
        // logging: console.log,
      },
    });
    if (err) return [null, err];
    data = JSON.parse(JSON.stringify(data));

    return [data, null];
  } catch (err) {
    logger.error(`Error while fetching task array by raw query: `, err);
    return [null, err.message];
  }
};

module.exports = getTaskArrayForTable;
