const SpotifyWebApi = require('spotify-web-api-node');
const apiSecrets = require('../spotifyInfo.js');
const spotifyApi = new SpotifyWebApi(apiSecrets);

class DMZController {
    async _setAuthToken(spotifyFunction, args, res) {
        try{
            let data = await spotifyApi.clientCredentialsGrant();
            spotifyApi.setAccessToken(data.body['access_token']);
            res.body = await spotifyApi[spotifyFunction](args);
            return res;

        } catch(e) {
            res.status = e.status | 500;
            res.body = e;
            return res;
        }

    }

    async Search(req, res) {
        try {
            res.body = await spotifyApi.searchAlbums(req.body);
        } catch (e) {
            let status = e.body.error.status;
            if(status ===401) {
                res = await this._setAuthToken('searchAlbums', req.body, res);
            } else {
                res.status =  status | 500;
                res.body = e;
            }
        }
        console.log('===========================');
        console.log(res.body);
        console.log('===========================');
        if(res.body.body) {
            res.body = res.body.body;
        }
        return res;
    }
}

module.exports = DMZController;
