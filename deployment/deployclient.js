const RmqClient = require('./rmq/rabbitMQClient');
const RmqData = require('./rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

const Deploy = require('./models/deployModel');
const deploy = new Deploy();

const {argv} = require('process');

function formatData(data) {
    let rtn = {};
    rtn['pkg_name'] = data[0].Title;
    rtn['pkg_type'] = data[0].Type;
    rtn['files'] = {};
    for(let row of data) {
        rtn['files'][row.FileName] = row.content;
    }
    return rtn;
}

async function main() {
    if(argv.length < 3){
        throw "Inculde a command"
    }
    let command = argv[2];
    if(command === 'lst-pkg') {
        let lst = await deploy.listPkg();
        console.log('Packages:');
        for(let row of lst) {
            console.log(row.Title);
        }
        process.exit();
    }
    if(command === 'test') {
        if(argv.length < 4){
            throw "No package name provided"
        }
        let data = await deploy.getPkg(argv[3]);
        if(deploy.length < 1) {
            throw "no package was found";
        }
        let msg = formatData(data);
        await deploy.setOnTest(data);
        console.log(msg);

        console.log(rmqClient.queue);
        rmqClient.queue = 'test_' + msg.pkg_type;
        console.log(rmqClient.queue);
        await rmqClient.sendData(msg);
        process.exit();
    }
    if(command === 'deploy') {
        // let data = deploy.getTested()
        // for(let row of data)
    }
}

main().then().catch((e)=>{console.log(e)});
