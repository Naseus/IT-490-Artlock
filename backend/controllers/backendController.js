const LoginClient = require('../models/loginClient');
const crypto = require('crypto');

class BackendController {
    async Login(req) {
    let res = JSON.parse('{"status":200, "body":""}');
        let loginclient = new LoginClient();

        if(!(req.username && req.password)) {
            res.status = 403;
            res.body = "username or password not included";
            return res;
        }

        // Check to make sure that the username is in the database
        let data = await loginclient.getOneUserByName(req.username);
        let user = data[0];
        if(!user) {
            res.status = 404;
            res.body = "Username or password is incorecct";
            return res;
        }
        let hash = crypto.createHash('sha1').update(req.password).digest('base64');
        // check that the password matches the hash
        if (user.Password === hash) {
            res.body = await loginclient.getOrCreateToken(user);
            return res;
        }

        res.status = 404;
        res.body = "Username or password is incorecct";
        return res;
    }

    resource(obj) {}

    RegisterUser() {}
}

module.exports = BackendController;
