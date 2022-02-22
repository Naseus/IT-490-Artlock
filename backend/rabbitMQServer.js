const amqp = require('amqplib/callback_api');

class Server {
    constructor(mqData) {
        this.mqUrl = (`amqp://${mqData["USER"]}`
                +`:${mqData["PASSWORD"]}`
                + `@${mqData["BROKER_HOST"]}`
                + `:${mqData["BROKER_PORT"]}`
                + `/${mqData["VHOST"]}`);

        this.queue = mqData['QUEUE']
        this.exchange = mqData['EXCHANGE']
    }

    reply(msg, channel) {
        // Formating the routing key to match the php client
        let replyTo = msg.fields.routingKey + '.response';

        if(replyTo) {
            channel.publish(this.exchange, replyTo, msg.content, {
                "correlationId":msg.properties.correlationId
            });
        }
    }

    run() {
        amqp.connect(this.mqUrl, (error0, connection) => {
            if (error0) {
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
            }

                channel.assertExchange(this.exchange);
                channel.assertQueue(this.queue);

                console.log(`Waiting for messages at ${this.mqUrl} in ${this.queue}`);

                channel.consume(this.queue, (msg) => {
                    console.log(`Received ${msg.content.toString()}"`);
                    this.reply(msg, channel)
                    channel.ack(msg);
                });
            });
        });
    }
}

module.exports = Server;
