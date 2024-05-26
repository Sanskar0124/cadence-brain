const setLeadCadenceOrderToMax = require('./setLeadCadenceOrderToMax');
const addLeadToCadence = require('./addLeadToCadence');
const updateLeadCadenceOrderForCadence = require('./updateLeadCadenceOrderForCadence');
const updateLeadToCadenceForCompletedLeads = require('./updateLeadToCadenceForCompletedLeads');
const updateLeadToCadenceForDeletedNodesWithNoNextNodes = require('./updateLeadToCadenceForDeletedNodesWithNoNextNodes');

const LeadToCadenceHelper = {
  setLeadCadenceOrderToMax,
  addLeadToCadence,
  updateLeadCadenceOrderForCadence,
  updateLeadToCadenceForCompletedLeads,
  updateLeadToCadenceForDeletedNodesWithNoNextNodes,
};

module.exports = LeadToCadenceHelper;
