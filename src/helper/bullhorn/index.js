const formatContactsForPreview = require('./formatContactsForPreview');
const formatCandidatesForPreview = require('./formatCandidateForPreview');
const formatLeadsForPreview = require('./formatLeadsForPreview');
const updateIntegrationStatus = require('./updateIntegrationStatus');

const BullhornHelper = {
  formatContactsForPreview,
  formatLeadsForPreview,
  formatCandidatesForPreview,
  updateIntegrationStatus,
};

module.exports = BullhornHelper;
