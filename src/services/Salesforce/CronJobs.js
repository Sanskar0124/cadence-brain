const reel = require('node-reel');
const fetchLeadsFromSalesforce = require('./lib/GetLeads');

module.exports = () => {
  reel()
    .call(() => {
      fetchLeadsFromSalesforce();
    })
    .everyFifteenMinutes()
    .run();
};
