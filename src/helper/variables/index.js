const replaceVariables = require('./replaceVariables');
const replaceVariablesForLead = require('./replaceVariablesForLead');
const replaceVariablesForActivity = require('./replaceVariablesForActivity');
const replaceCustomVariables = require('./replaceCustomVariables');

const VaribalesHelper = {
  replaceVariables,
  replaceVariablesForLead,
  replaceVariablesForActivity,
  replaceCustomVariables,
};

module.exports = VaribalesHelper;
