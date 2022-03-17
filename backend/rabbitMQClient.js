const amqp = require('amqplib');

class Client {
    constructor(mqData) {
        console.log(mqData);
        this.mqUrl = (`amqp://${mqData["USER"]}`
                +`:${mqData["PASSWORD"]}`
                + `@${mqData["BROKER_HOST"]}`
                + `:${mqData["BROKER_PORT"]}`
                + `/${mqData["VHOST"]}`);

        this.queue = mqData['QUEUE']
        this.exchange = mqData['EXCHANGE']
    }

    async sendData(msg){
        console.log(this.mqUrl);
        let conn = await amqp.connect(this.mqUrl)
        console.log(conn);
         //   return "connected";
        console.log('help');
        console.log('help');
        let channel = await conn.createChannel();
        channel.publish(this.exchange, '*', Buffer.from(JSON.stringify(msg)));

        let rqueue = this.queue + '_response';
        await channel.assertQueue(rqueue, {'durable':false});
        await channel.bindQueue(rqueue, this.exchange, '*.response');

        let res = false;
        let i = 0;
        while(!res && i < 300) {
            res = await channel.get(rqueue);
            i++;
        }
        console.log(res);

        if(!res)
            return false;

        channel.close();
        conn.close();

        return JSON.parse(res.content.toString());
    }
}

module.exports = Client;
