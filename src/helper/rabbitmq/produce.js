// Utils
const logger = require('../../utils/winston');
const getConnection = require('../../utils/rabbitmq');
const { AMQP_DELAY_EXCHANGE } = require('../../utils/constants');

let channel = null;

/**
 *
 * @param {String} queueName - name of the queue to which data needs to be added
 * @param {Object} data - data to add to queue
 * @returns {Promise} - [data,err]
 */
const produce = (exchangeName, queueName, data, delay = 0) => {
  return new Promise(async (resolve, reject) => {
    //const connection = await getConnection();
    let connection = global.rabbitmq_connection;
    if (!connection) return reject([null, `Connection to rabbitmq not found`]);

    channel = global.rabbitmq_channel;

    if (!channel) reject([null, `Channel not found`]);
    // console.log(data);

    //channel?.assertExchange(AMQP_DELAY_EXCHANGE, 'x-delayed-message', {
    //durable: true,
    //autoDelete: false,
    //arguments: {
    //'x-delayed-type': 'direct',
    //},
    //});

    channel?.assertExchange(exchangeName, 'direct', {
      durable: true,
      autoDelete: false,
      //arguments: {
      //'x-delayed-type': 'direct',
      //},
    });

    // * Checks If queue with name "queueName" is present or not, If not present it creates one.
    channel?.assertQueue(queueName, { durable: true });

    let sendToQueueOptions = {
      persistent: true,
    };

    //if (delay)
    //sendToQueueOptions = {
    //...sendToQueueOptions,
    //headers: {
    //'x-delay': delay,
    //},
    //};

    logger.info(JSON.stringify(sendToQueueOptions, null, 4));

    channel?.bindQueue(queueName, exchangeName, queueName);

    //channel?.bindQueue(queueName);

    const publishData = channel?.publish(
      exchangeName,
      //'',
      queueName,
      Buffer.from(JSON.stringify(data)),
      sendToQueueOptions
    );
    console.log('Publish data: ', publishData);

    logger.info(`Message Added to Queue.`);

    // close the channel
    //channel.close();

    return resolve([`Message Added to Queue.`, null]);

    //connection.createChannel((err, newChannel) => {
    //if (err) {
    //logger.error(
    //`Error while creating channel for producer: ${err.message}.`
    //);
    //return reject([
    //null,
    //`Error while creating channel for producer: ${err.message}.`,
    //]);
    //}

    //channel = newChannel;

    //return reject([null, `Channel not created.`]);
    //});
  });
};

module.exports = produce;
