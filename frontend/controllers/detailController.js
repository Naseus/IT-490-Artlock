const RmqClient = require('../rmq/rabbitMQClient');
const RmqData = require('../rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);
// Helper functions
// TODO: Base 64 encode date for front end to prevent template injection
async function postReview(req, res) {
    let data = await rmqClient.sendData({
        'type':'CreateReview',
        'token':req.cookies.token,
        'text':req.body.review_text,
        'art_stars':req.body.art_stars,
        'stars':req.body.stars,
        'album':req.params.Aid,
    });
    res.redirect('.');
}

async function postComment(req, res) {
    let data = await rmqClient.sendData({
        'type':'CreateComment',
        'token':req.cookies.token,
        'review':req.body.comment_on,
        'text':req.body.comment_text,
    });
    res.redirect('.');

}

module.exports = {
    async get(req, res) {
        let album = await rmqClient.sendData({
            'type': 'Album',
            'token': req.cookies.token,
            'album':req.params.Aid
        });
        let reviews = await rmqClient.sendData({
            'type': 'GetAlbumReviews',
            'token': req.cookies.token,
            'album':req.params.Aid
        });
        let comments = await rmqClient.sendData({
            'type': 'GetAlbumComments',
            'token': req.cookies.token,
            'album':req.params.Aid
        });

        album = album.body[0];
        comments = comments.body;
        reviews = reviews.body;

        res.render('album',{album:album, reviews:reviews,comments:comments});
    },

    async post(req, res) {
        console.log(res.body)
        if(req.body.comment) {
            postComment(req, res);
        }
        else if(req.body.review) {
            postReview(req, res);
        }
    }
}
