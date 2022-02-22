const amqp = require('amqplib/callback_api');
const fs = require('fs');

// Init data for the rabbitMQ connection
// This can be done in sync since all other server functions require this data
let mqData = JSON.parse(fs.readFileSync('rabbitMQ.json'));

let mqUrl = (`amqp://${mqData["USER"]}`
            +`:${mqData["PASSWORD"]}`
            + `@${mqData["BROKER_HOST"]}`
            + `:${mqData["BROKER_PORT"]}`
            + `/${mqData["VHOST"]}`);

        let queue = mqData['QUEUE']

amqp.connect(mqUrl, (error0, connection) => {
    if (error0) {
        throw error0;
    }
    connection.createChannel((error1, channel) => {
        if (error1) {
            throw error1;
        }

        channel.assertExchange(mqData['EXCHANGE']);
        channel.assertQueue(queue);

        console.log(`Waiting for messages at ${mqUrl} in ${queue}`);

        channel.consume(queue, function(msg) {
            console.log(`Received ${msg.content.toString()}"`);

            // Formating the routing key to match the php client
            let replyTo = msg.fields.routingKey + '.response';

            if(replyTo) {
                channel.publish(mqData["EXCHANGE"], replyTo, msg.content, {
                    "correlationId":msg.properties.correlationId
                });
            }
            channel.ack(msg);
        });
    });
});
