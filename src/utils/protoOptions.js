const PROTO_PATHS = require('../../../cadence-proto/main');

module.exports = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: PROTO_PATHS,
};
