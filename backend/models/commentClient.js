const mySQLClient = require('./mysqlClient.js');

class CommentClient extends mySQLClient {
    async createComment(review, text, user){
        let query = 'INSERT INTO Comment(CommentOn, CommentText, Commenter) VALUES(?,?,?)';
        return await super.makeQuery(query, [review, text, user]);
    }

    async getAlbumComments(album) {
        let query = 'SELECT Cid,CommentOn,Commenter,Username,CommentText FROM Comment'
                    +' INNER JOIN ALUser ON Comment.Commenter=ALUser.UserId'
                    +' INNER JOIN Review ON Comment.CommentOn=Review.Rid'
                    +' INNER JOIN Album ON Review.Album=Album.Aid'
                    +' WHERE Review.Album=?';
        return await super.makeQuery(query, [album]);
    }

    async updateComment(text, cid, user) {
        let query = 'UPDATE Comment SET CommentText=? WHERE Cid=? AND Commenter=?;';
        return await super.makeQuery(query, [text, cid, user]);
    }

    async deleteComment(cid, user) {
        let query = 'DELETE FROM Comment WHERE Cid=? AND Commenter=?';
        return await super.makeQuery(query, [cid, user])
    }
}

module.exports = CommentClient;
