// Utils
const logger = require('../../utils/winston');
const { DB_MODELS, DB_TABLES } = require('../../utils/modelEnums');
const { LEADERBOARD_DATE_FILTERS } = require('../../utils/enums');

// Packages

// Repository
const Repository = require('../../repository');

const getStatusArrayForTable = async ({
  company_id,
  start_time,
  end_time,
  cadence_id = false,
  user_id = false,
}) => {
  try {
    const start_time_sql = new Date(start_time)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const end_time_sql = new Date(end_time)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    let filter_query = ` 
    WHERE  \`lead\`.\`company_id\` = '${company_id}'
    AND \`lead\`.\`status\` IN ( 'converted', 'trash' )
    AND \`lead\`.\`status_update_timestamp\` BETWEEN
       '${start_time_sql}' AND '${end_time_sql}' 
      `;
    if (cadence_id) {
      if (Array.isArray(cadence_id))
        filter_query += ` and \`lead_to_cadence\`.\`cadence_id\` IN  (${cadence_id?.join(
          ','
        )}) `;
      else
        filter_query += `and \`lead_to_cadence\`.\`cadence_id\` = ${cadence_id} `;
    }

    if (user_id) {
      if (Array.isArray(user_id)) {
        const formattedIds = user_id.map((id) => `'${id}'`).join(',');
        filter_query += ` and \`lead\`.\`user_id\` IN (${formattedIds}) `;
      } else {
        filter_query += `and \`lead\`.\`user_id\` = '${user_id}' `;
      }
    }

    const query = `
    with status_count as (
        SELECT
        SUM(
        lead.status = "converted")                       
                AS \`converted_count\`
               ,
        SUM(lead.status = "trash")                          
               AS
               \`disqualified_count\`,
               \`lead\`.\`user_id\`,
               \`lead_to_cadence\`.\`cadence_id\` AS cadence_id 
        from \`lead\`
        
               INNER JOIN \`lead_to_cadence\`
                       ON \`lead\`.\`lead_id\` = \`lead_to_cadence\`.\`lead_id\`
                          AND \`lead_to_cadence\`.\`cadence_id\` IS NOT NULL
       ${filter_query}
        GROUP  BY \`lead\`.\`user_id\`,
                  \`lead_to_cadence\`.\`cadence_id\` ),
        
        
        -- Find unique cadences and count nodes and leads for those cadences 
        unique_cadences as (
                select 
                    cadence.name as name,
                    cadence.cadence_id as cadence_id
                    from status_count
                    inner join cadence on cadence.cadence_id = status_count.cadence_id
                    group by status_count.cadence_id
        ),
        
        cadence_common_data_with_node as (
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
            from cadence_common_data_with_node
            group by cadence_id
        ),
        
        
        cadence_common_data_with_count as (
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
                    from status_count
                    inner join user on user.user_id = status_count.user_id
                    group by status_count.user_id
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
               status_count.\`converted_count\`,
               status_count.\`disqualified_count\`,
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
           FROM status_count 
           left join unique_users_with_sd user_data on user_data.user_id = status_count.user_id
           left join cadence_common_data_with_count cadence_data on cadence_data.cadence_id = status_count.cadence_id 
           left join ltc_count on ltc_count.cadence_id = status_count.cadence_id and ltc_count.user_id = status_count.user_id
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
    logger.error(`Error while fetching status array by raw query: `, err);
    return [null, err.message];
  }
};

module.exports = getStatusArrayForTable;
