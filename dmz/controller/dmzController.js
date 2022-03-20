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

    async _callFunc(func, args, res) {
        try {
            res.body = await spotifyApi[func](args);
        } catch (e) {
            let status = e.body.error.status;
            if(status ===401) {
                res = await this._setAuthToken(func, args, res);
            } else {
                res.status =  status | 500;
                res.body = e;
            }
        }
        if(res.body.body) {
            res.body = res.body.body;
        }
        return res;
    }

    async Search(req, res) {
        return await this._callFunc('searchAlbums', req.body, res);
    }

    async Recommendation(req, res) {
        let args ={
            'min_energy':0.4,
            'seed_artists': req.body,
            'min_popularity':50
        };
        return await this._callFunc('getRecommendations', args, res)
    }
}

module.exports = DMZController;
