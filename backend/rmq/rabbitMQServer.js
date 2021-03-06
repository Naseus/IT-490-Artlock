const amqp = require('amqplib/callback_api');

class Server {
    constructor(mqData, handler) {
        this.mqUrl = (`amqp://${mqData["USER"]}`
                +`:${mqData["PASSWORD"]}`
                + `@${mqData["BROKER_HOST"]}`
                + `:${mqData["BROKER_PORT"]}`
                + `/${mqData["VHOST"]}`);

        this.queue = mqData['QUEUE'];
        this.exchange = mqData['EXCHANGE'];
        this.handler = handler
    }

    async reply(msg, channel) {
        // Formating the routing key to match the php client
        let replyTo = this.queue + '_response';

        if(replyTo) {
            channel.publish('', replyTo, await this.handler.handle(msg), {
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

                channel.consume(this.queue, async (msg) => {
                    console.log(`Received ${msg.content.toString()}"`);
                    await this.reply(msg, channel)
                    channel.ack(msg);
                });
            });
        });
    }
}

module.exports = Server;
