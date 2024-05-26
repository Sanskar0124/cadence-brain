'use strict';

const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const opentelemetry = require("@opentelemetry/sdk-node");
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { OTTracePropagator } = require('@opentelemetry/propagator-ot-trace');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { SequelizeInstrumentation } = require('opentelemetry-instrumentation-sequelize');
const { AmqplibInstrumentation } = require('@opentelemetry/instrumentation-amqplib');
const { RedisInstrumentation } = require('@opentelemetry/instrumentation-redis-4');
// const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');
// const { AwsInstrumentation } = require("@opentelemetry/instrumentation-aws-sdk");
// const { SocketIoInstrumentation } = require("@opentelemetry/instrumentation-socket.io");
// const { DnsInstrumentation } = require('@opentelemetry/instrumentation-dns');
// const { FsInstrumentation } = require('@opentelemetry/instrumentation-fs');

const endpoint =
  process.env.OTEL_TRACE_ENDPOINT || 'http://agent:14268/api/traces';

const options = {
  tags: [],
  endpoint,
};

const init = (serviceName, environment) => {
  const exporter = new JaegerExporter(options);

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
    }),
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  provider.register({ propagator: new OTTracePropagator() });

  console.log(`tracing to ${options.endpoint}`);

  const sdk = new opentelemetry.NodeSDK({
    traceExporter: exporter,
    instrumentations: [
      new RedisInstrumentation(),
      new AmqplibInstrumentation(),
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new SequelizeInstrumentation(),
      /* 
      new FsInstrumentation(),
      new DnsInstrumentation(),
      new WinstonInstrumentation(),
      new SocketIoInstrumentation(),
      new AwsInstrumentation(),
      */
    ],
  });

  sdk
  .start()
  .then(() => {
      console.log("Tracing initialized");
  })
  .catch((error) => console.log("Error initializing tracing", error));
  return {
    tracingSDK: sdk
  }
};

module.exports = {
  init: init,
};
