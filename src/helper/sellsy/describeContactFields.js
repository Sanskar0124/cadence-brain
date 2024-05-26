const describeContactFields = [
  {
    label: 'Civility',
    value: 'civility',
    type: 'string',
    enums: ['mr', 'mrs', 'ms'],
  },
  {
    label: 'First Name',
    value: 'first_name',
    type: 'string',
  },
  {
    label: 'Last Name',
    value: 'last_name',
    type: 'string',
  },
  {
    label: 'Email',
    value: 'email',
    type: 'string',
  },
  {
    label: 'Website',
    value: 'website',
    type: 'string',
  },
  {
    label: 'Phone Number',
    value: 'phone_number',
    type: 'string',
  },
  {
    label: 'Mobile Number',
    value: 'mobile_number',
    type: 'string',
  },
  {
    label: 'Fax Number',
    value: 'fax_number',
    type: 'string',
  },
  {
    label: 'Position',
    value: 'position',
    type: 'string',
  },
  {
    label: 'DOB',
    value: 'birth_date',
    type: 'string',
  },
  {
    label: 'Avatar',
    value: 'avatar',
    type: 'string',
  },
  {
    label: 'Note',
    value: 'note',
    type: 'string',
  },
  {
    label: 'Invoicing Address Id',
    value: 'invoicing_address_id',
    type: 'integer',
    editable: false,
  },
  {
    label: 'Delivery Address Id',
    value: 'delivery_address_id',
    type: 'integer',
    editable: false,
  },
  {
    label: 'Twitter',
    value: 'social.twitter',
    type: 'string',
  },
  {
    label: 'Facebook',
    value: 'social.facebook',
    type: 'string',
  },
  {
    label: 'Linkedin',
    value: 'social.linkedin',
    type: 'string',
  },
  {
    label: 'Viadeo',
    value: 'social.viadeo',
    type: 'string',
  },
  {
    label: 'Mailchimp',
    value: 'sync.mailchimp',
    type: 'boolean',
  },
  {
    label: 'Mailjet',
    value: 'sync.mailjet',
    type: 'boolean',
  },
  {
    label: 'Simplemail',
    value: 'sync.simplemail',
    type: 'boolean',
  },
  {
    label: 'is_archived',
    value: 'is_archived',
    type: 'boolean',
  },
  {
    label: 'Marketing campaigns Subscriptions',
    value: 'marketing_campaigns_subscriptions',
    type: 'array',
    enums: ['sms', 'phone', 'email', 'postal_mail', 'custom'],
  },
  {
    label: 'Created',
    value: 'created',
    type: 'string',
    editable: false,
  },
  {
    label: 'Updated',
    value: 'updated',
    type: 'string',
    editable: false,
  },
  {
    label: 'Smart Tags',
    value: 'smart_tags',
    type: 'tag',
  },
];

module.exports = describeContactFields;
