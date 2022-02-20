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

console.log(mqUrl);

amqp.connect(mqUrl, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        queue = mqData['QUEUE']

        //channel.assertExchange(mqData['EXCHANGE']);
        channel.assertQueue();

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
        }, {
            noAck: false
        });
    });
});
