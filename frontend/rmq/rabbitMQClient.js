const amqp = require('amqplib');

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

    async sendData(msg){
        console.log(msg);
        let conn = await amqp.connect(this.mqUrl)
        let channel = await conn.createChannel();
        channel.publish(this.exchange, '*', Buffer.from(JSON.stringify(msg)));

        let rqueue = this.queue + '_response';
        await channel.assertQueue(rqueue, {'durable':false, 'autoDelete':true});
        await channel.bindQueue(rqueue, this.exchange, '*.response');

        let res = false;
        let i = 0;
        while(!res && i < 3000) {
            res = await channel.get(rqueue, {'noAck':true});
            i++;
        }
        channel.ackAll();

        if(!res)
            return false;

        channel.close();
        conn.close();

        return JSON.parse(res.content.toString());
    }
}

module.exports = Client;
