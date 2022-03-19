const mySQLClient = require('./mysqlClient.js');

class ReviewClient extends mySQLClient {
    async createReview(text, artStars, stars, user, album) {
        let query = 'INSERT INTO Review(ReviewText, ArtStars, Stars, Reviewer, Album)'
                    +' VALUES(?,?,?,?,?);';
        return await super.makeQuery(query, [text, artStars, stars, user, album]);
    }

    async getReviewsByAlbum(album) {
        let query = 'SELECT Rid, ReviewText, Reviewer, Stars, ArtStars, Album, Username'
                    +' FROM Review INNER JOIN ALUser ON Review.Reviewer=ALUser.UserId'
                    +' WHERE Album=?;';
        return await super.makeQuery(query, [album]);
    }

    async updateReview(text, artStars, stars, user, rid) {
        let query = 'UPDATE Review SET'
                    +' ReviewText=?, ArtStars=?, Stars=?'
                    +' WHERE Reviewer=? AND Rid=?;';
        return await super.makeQuery(query, [text, artStars, stars, user, rid]);
    }

    async deleteReview(rid, user) {
        let query = 'DELETE FROM Review WHERE Rid=? AND Reviewer=?;';
        return await super.makeQuery(query, [rid, user]);
    }
}

module.exports = ReviewClient;
