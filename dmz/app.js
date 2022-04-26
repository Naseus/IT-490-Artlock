const Server = require('./rmq/rabbitMQServer');
const Handler = require('./responseHandler');
const Controller = require('./controller/dmzController.js');

const mqData = require('./dmzRabbitMQ.js');

// Init data for the rabbitMQ connection
// This can be done in sync since all other server functions require this data
let controller = new Controller()

let server = new Server(mqData, new Handler(controller));

server.run()


