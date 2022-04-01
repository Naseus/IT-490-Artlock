const RmqClient = require('../rmq/rabbitMQClient');
const RmqData = require('../rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

// Helper functions
async function createNewStack(stack, req) {
    let data = await rmqClient.sendData({
        'type':'CreateStack',
        'token':req.cookies.token,
        'name': stack
    });
}

async function addToStack(stack, req) {
    let data = await rmqClient.sendData({
        'type':'AddToStack',
        'token':req.cookies.token,
        'stack':stack,
        'album':req.body.album
    });
}

module.exports = {
    async get(req, res) {
        let data = await rmqClient.sendData({
            'type':'GetUserStacks',
            'token':req.cookies.token,
        });
        res.render('profile',{stacks:data.body});
    },

    async post(req, res) {
        if(req.body.stack !== "") {
            await addToStack(req.body.stack, req);
        } else if(req.body.newStack !== '') {
            await createNewStack(req.body.newStack, req);
            // TODO: find a way to add and create at the same time
            // await addToStack(req.body.CreateStack, req);
        }
        // Redirect to the last page
        res.redirect(req.headers.referer);
    }
}
