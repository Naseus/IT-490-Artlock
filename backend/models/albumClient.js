const mySQLClient = require('./mysqlClient.js');

class AlbumClient extends mySQLClient {
    async createAlbums(albums) {
        let query = '';
        let fields = [];
        let rtn = [];
        for(let album of albums) {
            query = 'INSERT INTO Album(Aid, AlbumArt, AlbumName, Artist, ArtistName, TrendScore, LastReviewAverage)'
                    +' Values(?, ?, ?, ?, ?, 0, 0);';
            try {
            rtn.push(await super.makeQuery(
                query,
                [album.Aid, album.AlbumArt, album.AlbumName, album.Artist, album.ArtistName]
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

    async getByRatings() {
        let query = 'SELECT * FROM Album ORDER BY LastReviewAverage DESC';
        return await this.makeQuery(query);
    }

    async getByTrending() {
        let query = 'SELECT * FROM Album ORDER BY TrendScore DESC';
        return await this.makeQuery(query);
    }

    async getReviewedAlbums(user) {
        let query = 'SELECT * FROM Album'
                    +' INNER JOIN Review ON Album.Aid=Review.Album'
                    +' WHERE Review.Reviewer=?;';
        return await this.makeQuery(query, [user]);
    }

    async parseAndCreateAlbums(data){
        console.log(data);
        data = data.filter(album=>album.album_type!='single');
        let albums = [];
        for (let album of data) {
            albums.push(
                {
                    'Aid':album.id,
                    'AlbumArt': album.images[0].url,
                    'AlbumName': album.name,
                    'Artist': album.artists[0].id,
                    'ArtistName': album.artists[0].name

            });
            delete(album['available_markets']);
        }
        // Create Albums with the same names in our db
        console.log(JSON.stringify(albums));
        await this.createAlbums(albums);
        return albums;
    }
}

module.exports = AlbumClient;
