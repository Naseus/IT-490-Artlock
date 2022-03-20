const mysql = require('mysql');
const db_conn = require('./db_conn.js');

class mySqlClient {
    _makeQuery(query, fields, successCallback, errorCallback) {
        let connection = mysql.createConnection(db_conn);
        connection.connect((err) => {
            if(err)
                return err;
            connection.query(query, fields, (err, results) =>{
                    if(err)
                        return errorCallback(err);
                    return successCallback(results);
            });
        });
    }

    makeQuery(query, fields){
        return new Promise ((resolve, reject) =>{
            this._makeQuery(query, fields, (data)=>{
                resolve(data);
            }, (err)=>{
                reject(err);
            });
        });
    }

    async authToken(token) {
        let query = "SELECT * FROM ALUser INNER JOIN Token "
                  + "ON Token.AuthUser=ALUser.UserId WHERE Token.Token=?;";

        return await this.makeQuery(query, [token]);
    }
}

module.exports = mySqlClient;
