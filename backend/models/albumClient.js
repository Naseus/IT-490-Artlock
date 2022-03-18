const mySQLClient = require('./mysqlClient.js');

class AlbumClient extends mySQLClient {
    async createAlbums(albums) {
        let query = '';
        let fields = [];
        let rtn = [];
        for(let album of albums) {
            query = 'INSERT INTO Album(Aid, AlbumArt, Artist, ArtistName, TrendScore, LastReviewAverage)'
                    +' Values(?, ?, ?, ?, 0, 0);';
            try {
            rtn.push(await super.makeQuery(
                query,
                [album.Aid, album.AlbumArt, album.Artist, album.ArtistName]
            ));
            } catch(e){
                rtn.push(e.sqlMessage);
                // This can fail quitely, duplicate errors are expected
                console.log(e);
            }
        }
        console.log(query);
        for(let field of fields) {
            console.log(field);
        }
    }
}

module.exports = AlbumClient;
