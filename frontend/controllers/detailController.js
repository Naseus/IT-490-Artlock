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
    // Redirect to the current page. This should be used for most posts
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
        // Request all the RMQ data from the database
        // TODO: Posible refactor -- move this part of the code into a proper
        //       model
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
        let stacks = await rmqClient.sendData({
            'type': 'GetUserStacks',
            'token': req.cookies.token,
        });

        // TODO: Change backend to pass the album without the array
        // King if this is stil here let me know
        album = album.body[0];
        comments = comments.body;
        reviews = reviews.body;
        stacks = stacks.body;

        // Render the album view with all the api data
        res.render('album',{
          album:album,
          reviews:reviews,
          comments:comments,
          stacks:stacks,
        });
    },

    // The post function will check for a hidden input that identifies the form
    // and call the apropriate helper function
    async post(req, res) {
        if(req.body.comment) {
            postComment(req, res);
        }
        else if(req.body.review) {
            postReview(req, res);
        }
    }
}
