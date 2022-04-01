const RmqClient = require('./rmq/rabbitMQClient');
const RmqData = require('./rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

const detailController = require('./controllers/detailController.js')
const profileController = require('./controllers/profileController')
const stackController = require('./controllers/stackController')

const express = require('express');
const loginController = require('./controllers/loginController');

const router = new express.Router();

// Album list logic
//TODO: Refactor logic into a controller
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

// Login and register routes
router.get('/login', loginController.get);
router.post('/login', loginController.post);
router.get('/register', loginController.getRegister);
router.post('/register', loginController.postRegister);

// Logic for the search
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

// Album Routes
router.get('/album/:Aid/', detailController.get);
router.post('/album/:Aid/', detailController.post);

// Profile Routes
router.get('/profile/', profileController.get);
router.post('/profile/', profileController.post);

// Stack Routes
router.get('/stack/:Sid', stackController.get);

module.exports = router
