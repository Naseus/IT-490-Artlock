const RmqClient = require('../rmq/rabbitMQClient');
const RmqData = require('../rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

module.exports = {
    async get(req, res) {
        res.render('login');
    },

    async post(req, res) {
        if(!(req.body.username && req.body.password)) {
            res.render('login');
            res.end();
        }
        // Send a login to rabbitMQ
        let data = await rmqClient.sendData({
            'type':'Login',
            'username':req.body.username,
            'password':req.body.password
        });
        if(data.status === 200) {
            // Set the token in the users cookies
            res.cookie('token', data.body.token);
            res.render('login',{token:data.body.token, user:req.body.username});
        }
    },

    async getRegister(req,res){
        res.render('register');
    },

    async postRegister(req,res){
        // Check that the username and passwords match
        if (req.body.password !== req.body.confirmpassword) {
            res.render('register',{message:"Passwords don't match"});
            res.end();
        }
        // Check that the username and password is provided
        if(!(req.body.username && req.body.password)) {
            res.render('register');
            res.end();
        }
        // Send a request through rabbitMQ
        let data = await rmqClient.sendData({
            'type':'Register',
            'username':req.body.username,
            'password':req.body.password
        });
        if(data.status === 200) {
            // Set the token in the user's cookies
            res.cookie('token', data.body.token);
            res.render('login',{token:data.body.token, user:req.body.username});
            res.end();
        }
        // If there is a 403 error then another user already exists
        else if(data.status === 403) {
            res.render('register',{message:"A user with that name already exists"});
        } else {
            res.render('register');
        }
    }
}
