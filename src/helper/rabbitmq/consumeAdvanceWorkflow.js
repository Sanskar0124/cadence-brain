// Utils
const logger = require('../../utils/winston');

const consumeAdvanceWorkflow = (queueName, callback) => {
  return new Promise(async (resolve, reject) => {
    try {
      //const connection = await getConnection();
      let connection = global.rabbitmq_connection;
      if (!connection)
        return reject([null, `Connection to rabbitmq not found`]);
      connection.createChannel((err, channel) => {
        if (err) {
          logger.error(
            `Error while creating channel for consumer: ${err?.message || err}.`
          );
          return reject([null, err?.message || err]);
        }

        // channel = newChannel;

        if (channel) {
          // * Checks If queue with name "queueName" is present or not, If not present it creates one.
          channel?.assertQueue(queueName, { durable: true });

          // * Ensures that consumer doesn't get another task until it acknowledges it current task.
          channel.prefetch(1);

          channel.consume(
            queueName,
            async (message) => {
              try {
                logger.info(
                  `Consumed message at ${new Date().toLocaleString()}`
                );
                const data = JSON.parse(message?.content?.toString());
                await callback(data);

                logger.info(
                  `Acknowledging :-
	  ${JSON.parse(message.content)}`
                );
                channel.ack(message);
              } catch (err) {
                return logger.error(
                  `Error while consuming message in consumer callback: `,
                  err
                );
              }
            },
            { noAck: false }
          );
          return resolve([`Consumer created`, null]);
        } else {
          logger.error(`Channel not created.`);
          return reject([null, err?.message || err]);
        }
      });
    } catch (err) {
      logger.error(`Error in rabbitmq consume: `, err);
      return reject([null, err?.message || err]);
    }
  });
};

module.exports = consumeAdvanceWorkflow;
