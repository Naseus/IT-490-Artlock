const mySQLClient = require('./mysqlClient.js');
const { Blob } = require('buffer');

class DeployClient extends mySQLClient {
    async createPackage(pkg) {
        await super.makeQuery(
            'INSERT INTO Package(Title, Type) VALUES(?, ?)',
            [pkg.pkg_name, pkg.pkg_type]
        );
        for(const[file, content] of Object.entries(pkg.files)) {
            let data = Buffer.from(content.data).toString();
            await super.makeQuery(
                'INSERT INTO File(FileIn, FileName, content) VALUES(?,?,?)',
                [pkg.pkg_name, file, data]
            );
        }
    }

    async listPkg() {
        return await super.makeQuery('SELECT Title FROM Package');
    }

    async getPkg(pkg) {
        return await super.makeQuery(
            'SELECT * FROM Package INNER JOIN File ON Package.Title=File.FileIn WHERE Package.Title=?',
            [pkg]
        );
    }

    async setOnTest(pkg){
        // Make old pakage false
        let query = 'UPDATE Package SET Testing=false WHERE Type=?';
        let fields = [pkg.pkg_type];
        await super.makeQuery(query, fields);

        // Make new package true
        query = 'UPDATE Package SET Testing=true WHERE Title=?';
        fields = [pkg.pkg_name];
        return await super.makeQuery(query, fields);
    }
}

module.exports = DeployClient;
