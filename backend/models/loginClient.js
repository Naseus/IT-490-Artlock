const mySQLClient = require('./mysqlClient.js');

class LoginClient {
    constructor() {
        this.client = new mySQLClient();
    }

    async getOneUserByName(user) {
        let query = "SELECT * FROM ALUser WHERE Username=?";
        return await this.client.makeQuery(query, [user]);
    }

    async createToken(token, user) {
        let query = "INSERT INTO Token(Token, AuthUser, ExpireDate) VALUES (?,?,?)";
        let expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 5);
        return await this.client.makeQuery(query, [token, user, expireDate]);
    }

    async getOrCreateToken(user) {
        let query = "SELECT * FROM Token";
        let data = await this.client.makeQuery(query, ['none']);

        function genToken() {
            return  Math.random().toString(36).substr(2) +
                    Math.random().toString(36).substr(2);
        }
        let token = genToken(); //random token

        for(let i = 0; i < data.length; i++) {
            if(data[i].AuthUser === user.UserId) {
                return data[i].Token;
            }
            // Resets the loop if there is a collision
            if(data[i].Token === token) {
                token = genToken();
                i = 0;
            }
        }

        await this.createToken(token, user.UserId);
        return token;
    }

}

module.exports = LoginClient;
