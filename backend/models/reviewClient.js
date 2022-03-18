const mySQLClient = require('./mysqlClient.js');

class ReviewClient extends mySQLClient {
    async createReview(text, artStars, stars, user, album) {
        let query = 'INSERT INTO Review(ReviewText, ArtStars, Stars, Reviewer, Album)'
                    +' VALUES(?,?,?,?,?);';
        console.log(query);
        console.log([text, artStars, stars, user, album]);
        return await super.makeQuery(query, [text, artStars, stars, user, album]);
    }
}

module.exports = ReviewClient;
