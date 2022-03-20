const Server = require('./rabbitMQServer');
const fs = require('fs');
const Handler = require('./responseHandler');
const Controller = require('./controllers/backendController');

// Init data for the rabbitMQ connection
// This can be done in sync since all other server functions require this data
let mqData = JSON.parse(fs.readFileSync('rabbitMQ.json'));
let controller = new Controller()

let server = new Server(mqData, new Handler(controller));

server.run()


