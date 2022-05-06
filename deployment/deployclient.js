const RmqClient = require('./rmq/rabbitMQClient');
const RmqData = require('./rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

const Deploy = require('./models/deployModel');
const deploy = new Deploy();

const {argv} = require('process');

async function main() {
    if(argv.length < 3){
        throw "Inculde a command"
    }
    let command = argv[2];
    if(command === 'lst-pkg') {
        let lst = await deploy.listPkg();
        for(let row of lst) {
            console.log(row.Title);
        }
        process.exit();
    }
    if(command === 'deploy') {
        if(argv.length <= 4){
            throw "No pkg name provided"
        }
        let data = await deploy.getPkg(argv[3]);
        rmqClient.sendData(data, 'test_frontend');
        process.exit();
    }
}

main().then().catch((e)=>{console.log(e)});
