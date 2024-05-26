// Utils
const logger = require('../../utils/winston');

// Packages
const { parentPort, threadId } = require('worker_threads');

parentPort.on('message', async ({ data, worker_function_path }) => {
  const worker_function = require(worker_function_path);
  const result = await worker_function(data);
  parentPort.postMessage(result);
});
