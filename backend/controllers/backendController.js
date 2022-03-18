const crypto = require('crypto');
const LoginClient = require('../models/loginClient');
const AlbumClient = require('../models/albumClient');
const ReviewClient = require('../models/reviewClient');

const loginClient = new LoginClient();
const albumClient = new AlbumClient();
const reviewClient = new ReviewClient();


const RmqClient = require('../rabbitMQClient.js')

const rmqClient = new RmqClient(require('../dmzrabbitMQ.js'));

class BackendController {
    async Login(req, res) {

        if(!(req.username && req.password)) {
            res.status = 403;
            res.body = "username or password not included";
            return res;
        }

        // Check to make sure that the username is in the database
        let data = await loginClient.getOneUserByName(req.username);
        let user = data[0];
        if(!user) {
            res.status = 404;
            res.body = "Username or password is incorecct";
            return res;
        }
        let hash = crypto.createHash('sha1').update(req.password).digest('base64');
        // check that the password matches the hash
        if (user.Password === hash) {
            res.body = await loginClient.getOrCreateToken(user);
            return res;
        }

        res.status = 404;
        res.body = "Username or password is incorecct";
        return res;
    }

    async AuthenticateToken(req, res) {

        try {
            res.body = await loginClient.authToken(req.token);
            res.body = res.body[0].Username;
        } catch(e) {
            res.status = 500;
            res.body = e;
        }
        if(!res.body) {
            res.status = 404;
            res.body = "Token was not found";
        }
        return res;
    }

    async Register(req, res) {
        // Try to sign up the user with the given username and password
        // If the username is taken return an error from the db
        if(!(req.username && req.password)) {
            res.status = 412;
            res.body = "User or password were not provided";
            return res;
        }
        let hash = crypto.createHash('sha1').update(req.password).digest('base64');
        let data;

        try {
            data = await loginClient.registerUser(req.username, hash);
        } catch(e) {
            res.status = 403;
            res.body = "User already exists";
            return res;
        }

        if(data.affectedRows === 1) {
            let userData = await loginClient.getOneUserByName(req.username);
            return await loginClient.getOrCreateToken(userData[0]);
        }
        // Make sure that if there is a bug the user cannot get any information
        res.status = 500;
        res.body = "";
        return res;
    }

    async SearchAlbum(req, res) {
        let dmzReq = {'type':'Search','body':req.body};

        let user = await albumClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }

        let data = await rmqClient.sendData(dmzReq);
        if(!data) {
            res.status = 500;
            res.body = 'API fail';
            return res;
        }
        // Parse Album data
        data.body.albums.items = data.body.albums.items.filter(album=>album.album_type!='single');
        let albums = [];
        for (let album of data.body.albums.items) {
            albums.push(
                {
                    'Aid':album.id,
                    'AlbumArt': album.images[1].url,
                    'AlbumName': album.name,
                    'Artist': album.artists[0].id,
                    'ArtistName': album.artists[0].name

            });
            delete(album['available_markets']);
        }
        // Create Albums with the same names in our db
        console.log(JSON.stringify(albums));
        await albumClient.createAlbums(albums);
        // Send the data to the user
        res.body = albums;
        return res;

    }

    async TopAlbums(req, res) {
        let user = await albumClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        return await albumClient.getByRatings();
    }

    async TrendingAlbums(req, res) {
        let user = await albumClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        return await albumClient.getByTrending();
    }

    async CreateReview(req, res) {
        let user = await albumClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        return await reviewClient.createReview(req.text, req.art_stars, req.stars, user[0].UserId, req.album);
    }
}

module.exports = BackendController;
