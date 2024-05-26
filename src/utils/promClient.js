const { collectDefaultMetrics, register, Counter } = require('prom-client');
const gcStats = require('prometheus-gc-stats');

register.setDefaultLabels({
  app: process.env.JOB,
});
collectDefaultMetrics({
  app: process.env.JOB,
  prefix: 'node_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register,
});

// Set prometheus-gc-stats to collect GC stats
gcStats()();

// Custom metric - Counter for counting the number of requests
const totalRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'hostname'],
});

module.exports = {
  register,
  totalRequests,
};
