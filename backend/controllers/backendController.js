const LoginClient = require('../models/loginClient');
const crypto = require('crypto');

class BackendController {
    constructor() {
        this.loginclient = new LoginClient();
    }
    async Login(req, res) {

        if(!(req.username && req.password)) {
            res.status = 403;
            res.body = "username or password not included";
            return res;
        }

        // Check to make sure that the username is in the database
        let data = await this.loginclient.getOneUserByName(req.username);
        let user = data[0];
        if(!user) {
            res.status = 404;
            res.body = "Username or password is incorecct";
            return res;
        }
        let hash = crypto.createHash('sha1').update(req.password).digest('base64');
        // check that the password matches the hash
        if (user.Password === hash) {
            res.body = await this.loginclient.getOrCreateToken(user);
            return res;
        }

        res.status = 404;
        res.body = "Username or password is incorecct";
        return res;
    }

    resource(obj) {}

    async AuthenticateToken(req, res) {

        try {
            res.body = await this.loginclient.authToken(req.token);
            res.body = res.body[0];
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
            data = await this.loginclient.registerUser(req.username, hash);
        } catch(e) {
            res.status = 403;
            res.body = "User already exists";
            return res;
        }

        if(data.affectedRows === 1) {
            let userData = await this.loginclient.getOneUserByName(req.username);
            return await this.loginclient.getOrCreateToken(userData[0]);
        }
        // Make sure that if there is a bug the user cannot get any information
        res.status = 500;
        res.body = "";
        return res;
    }
}

module.exports = BackendController;
