const detailController = require('./controllers/detailController.js')
const profileController = require('./controllers/profileController')
const stackController = require('./controllers/stackController')
const loginController = require('./controllers/loginController');
const frontPageController = require('./controllers/frontPageController');

const express = require('express');

const router = new express.Router();

// Main page routes
router.get('/', frontPageController.getTop);
router.get('/trending', frontPageController.getTrending);
router.get('/recommendations', frontPageController.getRecommended);

// search
// NOTE: Right now since the search feeds a view similar to our front page it's
// logic is in the frontPageController but if we have more functional routes in
// our header there should be a header controller.
router.get('/search', frontPageController.getSearch);

// Login and register routes
router.get('/login', loginController.get);
router.post('/login', loginController.post);
router.get('/register', loginController.getRegister);
router.post('/register', loginController.postRegister);


// Album Routes
router.get('/album/:Aid/', detailController.get);
router.post('/album/:Aid/', detailController.post);

// Profile Routes
router.get('/profile/', profileController.get);
router.post('/profile/', profileController.post);

// Stack Routes
router.get('/stack/:Sid', stackController.get);

module.exports = router
