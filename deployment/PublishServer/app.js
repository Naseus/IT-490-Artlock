const Server = require('../rmq/rabbitMQServer');
const mqData = require('../rmq/rabbitMQ');
const Handler = require('./responseHandler');


let server = new Server(mqData, new Handler());

server.run('publish');
