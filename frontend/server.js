const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const RmqClient = require('./rmq/rabbitMQClient');
const RmqData = require('./rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

const app = express();


app.set('view engine', 'ejs');
app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.get('/', async (req,res) => {
    console.log(req.cookies);
    console.log(req.cookies.token);
    if(!req.cookies.token) {
        res.redirect('/login');
    }
    let data = await rmqClient.sendData({
    "type":"TopAlbums",
    "token": req.cookies.token
    });

    console.log('recived' + JSON.stringify(data));

    if (data.status === 403) {
        res.clearCookie("token");
        res.redirect('/login');
    }

    res.render('index', {albums: data.body});
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
        console.log('recived' + JSON.stringify(data));
        res.cookie('token', data.body.token);
        if(data.status === 200) {
            res.render('login',{token:data.body.token, user:req.body.username});
        }
    }
    res.render('login');
});

app.listen(3000);

console.log('listening on port 3000')
