const RmqClient = require('../rmq/rabbitMQClient');
const RmqData = require('../rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

module.exports = {
    async get(req, res) {
        console.log(req.body);
        let data = await rmqClient.sendData({
            'type':'GetStackAlbums',
            'token':req.cookies.token,
            'stack':req.params.Sid,
        });
        res.render('index',{albums:data.body});
    }
}
