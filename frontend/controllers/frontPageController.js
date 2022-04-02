const RmqClient = require('../rmq/rabbitMQClient');
const RmqData = require('../rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

//TODO: find a way for any controller to have this function
//      Look into the feasiblity of an abstract class
function checkLogin(stat, res) {
    if (stat === 403) {
        res.clearCookie('token');
        res.redirect('/login');
        res.end();
    }
}

// If the data is correct is renders the index as expected, but if there is an 
// error it will render the index with that error message.
function renderIndex(res, stat, albums) {
    msg = "a server error has occurred.";
    if(stat === 200){
        res.render('index', {albums:albums});
        res.end();
    } else {
        res.render('index', {message: msg});
        res.end();
    }
}

module.exports = {
    // get function for the Top page
    async getTop(req, res) {
        let data = await rmqClient.sendData({
            'type':'TopAlbums',
            'token': req.cookies.token
        });

        checkLogin(data.status, res);
        renderIndex(
            res,
            data.status,
            data.body.filter(album=>album.ReviewAverage > 0)
        );
    },

    async getTrending(req, res) {
        let data = await rmqClient.sendData({
            'type':'TrendingAlbums',
            'token': req.cookies.token
        });

        checkLogin(data.status, res);
        renderIndex(
            res,
            data.status,
            data.body.filter(album=>album.ReviewAverage > 0)
        );
    },

    async getSearch(req, res){
        let data = await rmqClient.sendData({
            'type':'SearchAlbum',
            'token': req.cookies.token,
            'body':req.query.searchQuery
        });

        checkLogin(data.status, res);
        renderIndex(res, data.status, data.body);
    },

    async getRecommended(req, res) {
        let data = await rmqClient.sendData({
            'type':'AlbumRecommendations',
            'token': req.cookies.token
        });

        checkLogin(data.status, res);
        if(typeof data.body.error !=='undefined' && data.body.error.status === 400) {
            res.render('index', {
                message:'No recommendations are available at this time. '
                +'leave a review and let us know what you like'
            });
        }
        renderIndex(res, data.status, data.body);
    }
}
