const crypto = require('crypto');
const LoginClient = require('../models/loginClient');
const AlbumClient = require('../models/albumClient');
const ReviewClient = require('../models/reviewClient');
const CommentClient = require('../models/commentClient');
const StackClient = require('../models/stackClient');

const loginClient = new LoginClient();
const albumClient = new AlbumClient();
const reviewClient = new ReviewClient();
const commentClient = new CommentClient();
const stackClient = new StackClient();


const RmqClient = require('../rabbitMQClient.js');

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
            res.body = await loginClient.getOrCreateToken(userData[0]);
            return res;
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
        let albums = await albumClient.parseAndCreateAlbums(data.body.albums.items);
        res.body = albums;
        return res;
    }

    async AlbumRecommendations(req, res) {
        let user = await albumClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        let reviewedAlbums = await albumClient.getReviewedAlbums(user[0].UserId);
        let tracks = [];
        let i = 0;
        for(let ele of reviewedAlbums){
            if(i++ > 5){
                break;
            }
            tracks.push(ele['Artist']);
        }
        let dmzReq = {'type':'Recommendation', 'body':tracks};

        let data = await rmqClient.sendData(dmzReq);
        if(!data) {
            res.status = 500;
            res.body = 'API fail';
            return res;
        }
        if(data.status != 200) {
            return data;
        }

        let albums = [];
        for(let ele of data.body.tracks)
            albums.push(ele['album']);

        albums = await albumClient.parseAndCreateAlbums(albums);
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
        res.body = await albumClient.getByRatings();
        return res;
    }

    async TrendingAlbums(req, res) {
        let user = await albumClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await albumClient.getByTrending();
        return res;
    }

    async Album(req, res) {
        let user = await albumClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await albumClient.getOneAlbum(req.album);
        return res;
    }

    async CreateReview(req, res) {
        let user = await reviewClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await reviewClient.createReview(req.text, req.art_stars, req.stars, user[0].UserId, req.album);
        return res;
    }

    async GetAlbumReviews(req, res) {
        let user = await reviewClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await reviewClient.getReviewsByAlbum(req.album)
        return res;
    }

    async EditReview(req, res) {
        let user = await reviewClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await reviewClient.updateReview(req.text, req.art_stars, req.stars, user[0].UserId, req.review);
        return res;
    }

    async DeleteReview(req, res) {
        let user = await reviewClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        if(req.review_id) {
            res.body = await reviewClient.deleteReview(req.review_id, user[0].UserId);
        } else {
            res.status = 404;
            res.body = "A review_id is required";
        }
        return res;
    }

    async CreateComment(req, res) {
        let user = await commentClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await commentClient.createComment(req.review, req.text, user[0].UserId);
        return res;
    }

    async EditComment(req, res) {
        let user = await commentClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        if(req.comment_id) {
            res.body = await commentClient.updateComment(req.text, req.comment_id, user[0].UserId);
        } else {
            res.status = 404;
            res.body = "A comment ID is required";
        }
        return res;
    }

    async GetAlbumComments(req, res) {
        let user = await commentClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await commentClient.getAlbumComments(req.album);
        return res;
    }

    async DeleteComment(req, res) {
        let user = await reviewClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        if(req.comment_id) {
            res.body = await commentClient.deleteComment(req.comment_id, user[0].UserId);
        } else {
            res.status = 404;
            res.body = "a comment_id is required";
        }
        return res;
    }

    async CreateStack(req, res) {
        let user = await stackClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await stackClient.createStack(user[0].UserId, req.name);
        return res;
    }

    async GetUserStacks(req, res) {
        let user = await stackClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await stackClient.getUserStacks(user[0].UserId);
        return res;
    }

    async GetStackAlbums(req, res) {
        let user = await stackClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await stackClient.readStackAlbums(req.stack);
        return res;
    }

    async AddToStack(req, res) {
        let user = await stackClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        let data = await stackClient.addToStack(req.stack, req.album, user[0].UserId);
        if(!data) {
            res.status = 403;
            res.body = "Forbidden";
        } else {
            res.body = data;
        }
        return res;
    }

    async DeleteFromStack(req, res) {
        let user = await stackClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        let data = await stackClient.removeFromStack(req.stack, req.album, user[0].UserId);
        if(!data) {
            res.status = 403;
            res.body = "Forbidden";
        } else {
            res.body = data;
        }
        return res;
    }

    async DeleteStack(req, res) {
        let user = await stackClient.authToken(req.token);
        if(!user[0]) {
            res.status = 403;
            res.body = "Forbidden";
            return res;
        }
        res.body = await stackClient.deleteStack(req.stack, user[0].UserId);
        return res;
    }
}

module.exports = BackendController;
