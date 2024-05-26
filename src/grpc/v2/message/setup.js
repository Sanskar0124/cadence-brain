// Utils
const { CALL_MESSAGE_GRPC_URL } = require('../../../utils/config');
const options = require('../../../utils/protoOptions');

// Packages
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const promisify = require('grpc-promisify');

const PROTO_FILE = 'call_message.proto';

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);

const proto = grpc.loadPackageDefinition(pkgDefs);

const client = new proto.CallMessageService(
  CALL_MESSAGE_GRPC_URL,
  grpc.credentials.createInsecure(),
  {
    'grpc.keepalive_timeout_ms': 2 * 60 * 60 * 1000, // 2 hours in miliseconds
    'grpc.keepalive_time_ms': 20 * 1000, // 20s in miliseconds
    'grpc.keepalive_permit_without_calls': true,
    'grpc.max_connection_idle_ms': 15 * 60 * 1000, // 15 minutes in miliseconds
    'grpc.http2.max_pings_without_data': 0, // disabled
  }
);

promisify(client);

module.exports = client;
