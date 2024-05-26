const company_fields = [
  {
    label: 'Type',
    value: 'type',
    type: 'string',
    editable: false,
  },
  {
    label: 'Name',
    value: 'name',
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
    label: 'Siret',
    value: 'legal_france.siret',
    type: 'string', // 14 chars
  },
  {
    label: 'Siren',
    value: 'legal_france.siren',
    type: 'string', // 9 chars
  },
  {
    label: 'VAT',
    value: 'legal_france.vat',
    type: 'string', // [2 .. 15] chars
  },
  {
    label: 'APE/NAF Code',
    value: 'legal_france.ape_naf_code',
    type: 'string', // [5 .. 6] chars
  },
  {
    label: 'Company Type',
    value: 'legal_france.company_type',
    type: 'string', // [3 .. 100] chars
  },
  {
    label: 'RCS Immatriculation Code',
    value: 'legal_france.rcs_immatriculation',
    type: 'string', // [3 .. 200] chars
  },
  {
    label: 'Capital',
    value: 'capital',
    type: 'string',
  },
  {
    label: 'Reference',
    value: 'reference',
    type: 'string',
  },
  {
    label: 'Note',
    value: 'note',
    type: 'string',
  },
  {
    label: 'Auxiliary Code',
    value: 'auxiliary_code',
    type: 'string',
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
    label: 'Rate Category Id',
    value: 'rate_category_id',
    type: 'integer',
    editable: false,
  },
  {
    label: 'Main Contact Id',
    value: 'main_contact_id',
    type: 'integer',
    editable: false,
  },
  {
    label: 'Dunning Contact Id',
    value: 'dunning_contact_id',
    type: 'integer',
    editable: false,
  },
  {
    label: 'Invoicing Contact Id',
    value: 'invoicing_contact_id',
    type: 'integer',
    editable: false,
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
    label: 'Accounting Code Id',
    value: 'accounting_code_id',
    type: 'integer',
    editable: false,
  },
  {
    label: 'Accounting Purchase Code Id',
    value: 'accounting_purchase_code_id',
    type: 'integer',
    editable: false,
  },
  {
    label: 'Business Segment',
    value: 'business_segment.label',
    type: 'string',
  },
  {
    label: 'Is Archived',
    value: 'is_archived',
    type: 'boolean',
  },
  {
    label: 'Number of Employees',
    value: 'number_of_employees.label',
    type: 'string',
  },
  {
    label: 'Marketing Campaigns Subscriptions',
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
    label: 'Updated At',
    value: 'updated_at',
    type: 'string',
    editable: false,
  },
  {
    label: 'Smart Tags',
    value: 'smart_tags',
    type: 'tag',
  },
];

const address_fields = [
  {
    label: 'Address Line 1',
    value: 'address_line_1',
    type: 'string',
    editable: false,
  },
  {
    label: 'Address Line 2',
    value: 'address_line_2',
    type: 'string',
    editable: false,
  },
  {
    label: 'Address Line 3',
    value: 'address_line_3',
    type: 'string',
    editable: false,
  },
  {
    label: 'Address Line 4',
    value: 'address_line_4',
    type: 'string',
    editable: false,
  },
  {
    label: 'Postal Code',
    value: 'postal_code',
    type: 'integer',
    editable: false,
  },
  {
    label: 'City',
    value: 'city',
    type: 'string',
    editable: false,
  },
  {
    label: 'Country',
    value: 'country',
    type: 'string',
    editable: false,
  },
  {
    label: 'Country Code',
    value: 'country_code',
    type: 'string',
    editable: false,
  },
  {
    label: 'Is Invoicing Address',
    value: 'is_invoicing_address',
    type: 'boolean',
    editable: false,
  },
  {
    label: 'Is delivery Address',
    value: 'is_delivery_address',
    type: 'boolean',
    editable: false,
  },
  {
    label: 'Latitude',
    value: 'geocode.lat',
    type: 'number',
    editable: false,
  },
  {
    label: 'Longitude',
    value: 'geocode.lng',
    type: 'number',
    editable: false,
  },
];

const describeCompanyFields = {
  company_fields,
  address_fields,
};

module.exports = describeCompanyFields;
