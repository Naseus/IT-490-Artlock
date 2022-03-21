const express = require('express');
const bodyParser = require('body-parser');

const RmqClient = require('./rmq/rabbitMQClient');
const RmqData = require('./rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.render('index');
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.post('/login', async (req,res) => {
    if(req.body.username && req.body.password) {
        let data = await rmqClient.sendData({
            'type':'Login',
            'username':req.body.username,
            'password':req.body.password
        });
        console.log(data);
        if(data.status === 200) {
            res.render('login',{token:data.body.token});
        }
    }
    res.render('login');
});

app.listen(3000);

console.log('listening on port 3000')
