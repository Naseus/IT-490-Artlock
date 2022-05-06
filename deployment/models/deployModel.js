const mySQLClient = require('./mysqlClient.js');
const { Blob } = require('buffer');

class DeployClient extends mySQLClient {
    async createPackage(pkg) {
        await super.makeQuery(
            'INSERT INTO Package(Title, Type) VALUES(?, ?)',
            [pkg.pkg_name, pkg.pkg_type]
        );
        console.log(pkg.files);
        for(const[file, content] of Object.entries(pkg.files)) {
            let data = await new Blob([content]).text();
            console.log("CONTENT" + data);
            console.log(`INSERT INTO File(FileIn, FileName, content) VALUES(${pkg.pkg_name},${file},${data})`);
            await super.makeQuery(
                'INSERT INTO File(FileIn, FileName, content) VALUES(?,?,?)',
                [pkg.pkg_name, file, data]
            );
        }
    }
}

module.exports = DeployClient;
