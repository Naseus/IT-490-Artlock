const amqp = require('amqplib');
const crypto = require('crypto');

class Client {
    constructor(mqData) {
        this.mqUrl = (`amqp://${mqData["USER"]}`
                +`:${mqData["PASSWORD"]}`
                + `@${mqData["BROKER_HOST"]}`
                + `:${mqData["BROKER_PORT"]}`
                + `/${mqData["VHOST"]}`);

        this.queue = mqData['QUEUE'];
        this.exchange = mqData['EXCHANGE'];
    }

    // Function for the client to send data to a consumer
    // The client sends a mesage and then waits for a response on the response
    // queue(rqueue).
    async sendData(msg){
        console.log(msg);
        // Hash the message and set it as the correlationId
        let corrId = crypto.createHash('sha1').update(JSON.stringify(msg)).digest('base64');

        let conn = await amqp.connect(this.mqUrl)
        let channel = await conn.createChannel();
        channel.publish(
            this.exchange,
            '*',
            Buffer.from(JSON.stringify(msg)),
            {"correlationId":corrId});

        // Create the queue with the approprate name
        let rqueue = this.queue + '_response';
        await channel.assertQueue(rqueue, {'durable':false, 'autoDelete':true});
        await channel.bindQueue(rqueue, this.exchange, '*.response');

        let res = false;
        let i = 0;
        // Attempt to get the data from rqueue. If the get fails to many times
        // the client purges the queue
        while(i < 5000) {
            i++;
            res = await channel.get(rqueue, {
                'noAck':true,
            });
            if(!res) {
                continue;
            }
            if (res.properties.correlationId === corrId) {
                break;
            }
            console.log('made it');
            channel.publish(this.exchange, '*.response', res.content, {
                "correlationId":res.properties.correlationId
            });
        }
        // TODO: Look into a more scalabe way to handle the extra requests. This
        //       might not work with multible clients.
        //channel.ackAll();

        if(!res)
            return false;

        channel.close();
        conn.close();
        console.log('recived: ' + res.content.toString());

        return JSON.parse(res.content.toString());
    }
}

module.exports = Client;
