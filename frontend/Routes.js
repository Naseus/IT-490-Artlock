const RmqClient = require('./rmq/rabbitMQClient');
const RmqData = require('./rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

const detailController = require('./controllers/detailController.js')
const profileController = require('./controllers/profileController')
const stackController = require('./controllers/stackController')

const express = require('express');

const router = new express.Router();

router.get('/', async (req,res) => {
    if(!req.cookies.token) {
        res.redirect('/login');
    }
    let data = await rmqClient.sendData({
        'type':'TopAlbums',
        'token': req.cookies.token
    });

    if (data.status === 403) {
        res.clearCookie('token');
        res.redirect('/login');
    } else {
      res.render('index', {albums:data.body.filter(album=>album.ReviewAverage > 0)});
    }
});

router.get('/trending', async (req, res)=>{
    if(!req.cookies.token) {
        res.redirect('/login');
        return;
    }
    let data = await rmqClient.sendData({
        'type':'TrendingAlbums',
        'token': req.cookies.token
    });
    if(data.status === 403) {
        res.clearCookie('token');
        res.redirect('/login');
    } else {
      res.render('index', {albums:data.body.filter(album=>album.ReviewAverage > 0)});
    }
});

router.get('/recommendations', async (req, res)=>{
    if(!req.cookies.token) {
        res.redirect('/login');
    }
    let data = await rmqClient.sendData({
        'type':'AlbumRecommendations',
        'token': req.cookies.token
    });
    if(data.status === 403) {
        res.clearCookie('token');
        res.redirect('/login');
    }

    if(typeof data.body.error !=='undefined' && data.body.error.status === 400) {
        res.render('index', {
            message:'No recommendations are available at this time. '
            +'leave a review and let us know what you like'
        });
    }
    res.render('index', {albums:data.body});

});

router.get('/login', (req,res) => {
    res.render('login');
    res.end();
});

router.post('/login', async (req,res) => {
    if(req.body.username && req.body.password) {
        let data = await rmqClient.sendData({
            'type':'Login',
            'username':req.body.username,
            'password':req.body.password
        });
        res.cookie('token', data.body.token);
        if(data.status === 200) {
            res.render('login',{token:data.body.token, user:req.body.username});
        }
    }
    res.render('login');
});

router.get('/register', async (req, res) =>{
    res.render('register');
});

router.post('/register', async (req,res) => {
    console.log(req.body);
    if (req.body.password !== req.body.confirmpassword) {
        res.render('register',{message:"Passwords don't match"});
    }
    if(req.body.username && req.body.password) {
        let data = await rmqClient.sendData({
            'type':'Register',
            'username':req.body.username,
            'password':req.body.password
        });
        res.cookie('token', data.body.token);
        if(data.status === 200) {
            res.render('login',{token:data.body.token, user:req.body.username});
            res.end();
        }
        else if(data.status === 403) {
            res.render('register',{message:"A user with that name already exists"});
        } else {
            res.render('register');
        }
    }
});

router.get('/search', async (req, res)=>{
    if(!req.cookies.token && req.query.searchQuery) {
        res.redirect('/login');
    }
    let data = await rmqClient.sendData({
        'type':'SearchAlbum',
        'token': req.cookies.token,
        'body':req.query.searchQuery
    });
    if(data.status === 403) {
        res.clearCookie('token');
        res.redirect('/login');
    }
    res.render('index', {albums:data.body});
});

router.get('/album/:Aid/', detailController.get);
router.post('/album/:Aid/', detailController.post);

router.get('/profile/', profileController.get);
router.post('/profile/', profileController.post);

router.get('/stack/:Sid', stackController.get);

module.exports = router
