const mySQLClient = require('./mysqlClient.js');

class LoginClient extends mySQLClient {

    async getOneUserByName(user) {
        let query = "SELECT * FROM ALUser WHERE Username=?";
        return await super.makeQuery(query, [user]);
    }

    async createToken(token, user) {
        let query = "INSERT INTO Token(Token, AuthUser, ExpireDate) VALUES (?,?,?)";
        let expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 5);
        return await super.makeQuery(query, [token, user, expireDate]);
    }

    async getOrCreateToken(user) {
        let query = "SELECT * FROM Token";
        let data = await super.makeQuery(query, ['none']);

        // Helper functions
        function genToken() {
            return  Math.random().toString(36).substr(2) +
                    Math.random().toString(36).substr(2);
        }

        function resToken(token) {
            return JSON.parse(`{"token":"${token}"}`);
        }

        let token = genToken(); //random token

        for(let i = 0; i < data.length; i++) {
            if(data[i].AuthUser === user.UserId) {
                return resToken(data[i].Token);
            }
            // Resets the loop if there is a collision
            if(data[i].Token === token) {
                token = genToken();
                i = 0;
            }
        }

        data = await this.createToken(token, user.UserId);
        return resToken(token);
    }

    async registerUser(user, password){
        let query = "INSERT INTO ALUser (username,password) VALUES (?,?)";
        let data = await super.makeQuery(query, [user, password]);
        return data;
    }
}

module.exports = LoginClient;
