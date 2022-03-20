const mySQLClient = require('./mysqlClient.js');
const updateAverage ='UPDATE Album'
                    +' SET ReviewAverage=(SELECT AVG(Stars) FROM Review WHERE Album=?),'
                    +' ArtAverage=(SELECT AVG(ArtStars) FROM Review WHERE Album=?)'
                    +' WHERE Aid=?';

class ReviewClient extends mySQLClient {
    async createReview(text, artStars, stars, user, album) {
        let query = 'INSERT INTO Review(ReviewText, ArtStars, Stars, Reviewer, Album)'
                    +' VALUES(?,?,?,?,?);';
        let rtn = await super.makeQuery(query, [text, artStars, stars, user, album]);
        await super.makeQuery(updateAverage, [album, album, album]);
        return rtn;
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
        let rtn = await super.makeQuery(query, [text, artStars, stars, user, rid]);
        await super.makeQuery(updateAverage, [album, album, album]);
        return rtn;
    }

    async deleteReview(rid, user) {
        let query = 'DELETE FROM Review WHERE Rid=? AND Reviewer=?;';
        return await super.makeQuery(query, [rid, user]);
    }
}

module.exports = ReviewClient;
