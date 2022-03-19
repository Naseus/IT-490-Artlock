const mySQLClient = require('./mysqlClient.js');

class StackClient extends mySQLClient {
    async createStack(user, name) {
        let query = 'INSERT INTO AlbumStack(CreatedBy, StackName)'
                    +' VALUES(?,?);';
        return super.makeQuery(query, [user, name]);
    }

    async getUserStacks(user) {
        let query = 'SELECT * FROM AlbumStack WHERE CreatedBy=?;';
        return super.makeQuery(query, [user]);
    }

    async canEditStack(user, sid){
        let query = 'SELECT * FROM AlbumStack WHERE CreatedBy=? AND Sid=?;';
        let data = await super.makeQuery(query, [user, sid]);
        if(data[0])
            return true;
        return false;
    }

    async readStackAlbums(stack){
        let query = 'SELECT Aid, AlbumArt, AlbumName, ArtistName FROM AlbumIn'
                    +' INNER JOIN Album ON AlbumIn.Album=Album.Aid'
                    +' WHERE AlbumIn.Stack=?;';
        return super.makeQuery(query, [stack]);
    }

    async addToStack(stack, album, user){
        let canEdit = await this.canEditStack(user, stack);
        let query = 'INSERT INTO AlbumIn(Stack, Album) VALUES(?,?);'
        if(canEdit)
            return await super.makeQuery(query, [stack, album, user]);
        return;
    }

    async removeFromStack(stack, album, user){
        let canEdit = await this.canEditStack(user, stack);
        let query = 'DELETE FROM AlbumIn WHERE Stack=? AND Album=?;'
        if(canEdit)
            return await super.makeQuery(query, [stack, album, user]);
        return;
    }

    async deleteStack(stack, user){
        let query = 'DELETE FROM AlbumStack WHERE Sid=? AND CreatedBy=?;';
        return super.makeQuery(query, [stack, user]);
    }
}

module.exports = StackClient;
