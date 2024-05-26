// Packages
const replaceall = require('replaceall');

const replaceVariablesForActivity = (body, variables) => {
  const {
    crm,
    //prospect
    lead_first_name,
    lead_last_name,
    today,
    // cadence
    cadence_name,
    pause_for,
    first_name,
    last_name,
    launch_at,
    // task
    task_name,
    // call
    incall_duration,
    total_duration,
    // mail
    mail_subject,
    // * Meeting
    scheduled_at,
    // note
    note,
    // linkedin
    message,
    //custom_task
    custom_task_name,
    reminder_time,
    //export_lead
    exported_as,
  } = variables;

  //prospect variables
  body = replaceall(
    '{{lead_first_name}}',
    lead_first_name?.toString() || '',
    body
  );
  body = replaceall(
    '{{lead_last_name}}',
    lead_last_name?.toString() || '',
    body
  );
  body = replaceall('{{today}}', today?.toString() || '', body);

  // cadence
  body = replaceall('{{cadence_name}}', cadence_name?.toString() || '', body);
  body = replaceall('{{pause_for}}', pause_for?.toString() || '', body);
  body = replaceall('{{user}}', `${first_name} ${last_name}` || '', body);
  body = replaceall('{{launch_at}}', launch_at?.toString() || '', body);
  body = replaceall(
    '{{by_user}}',
    first_name && last_name ? `by ${first_name} ${last_name}` : '' || '',
    body
  );

  // task
  body = replaceall('{{task_name}}', task_name?.toString() || '', body);

  // call
  body = replaceall(
    '{{incall_duration}}',
    incall_duration?.toString() || '',
    body
  );
  body = replaceall(
    '{{total_duration}}',
    total_duration?.toString() || '',
    body
  );

  // mail
  body = replaceall('{{mail_subject}}', mail_subject?.toString() || '', body);

  // * Meeting
  body = replaceall('{{scheduled_at}}', scheduled_at?.toString() || '', body);

  // note
  body = replaceall('{{note}}', note?.toString() || '', body);

  // linkedin
  body = replaceall('{{message}}', message?.toString() || '', body);

  body = replaceall(
    '{{crm}}',
    `${crm?.toString()[0].toUpperCase()}${crm?.toString().slice(1)}` ||
      'Salesforce',
    body
  );

  //custom_task
  body = replaceall(
    '{{custom_task_name}}',
    custom_task_name?.toString() || '',
    body
  );

  body = replaceall('{{reminder_time}}', reminder_time?.toString() || '', body);

  //export_lead
  body = replaceall('{{exported_as}}', exported_as?.toString() || '', body);

  return body;
};

//console.log(
//replaceVariablesForActivity('hello xd {task_name}', { task_name: 'noob' })
//);

module.exports = replaceVariablesForActivity;
