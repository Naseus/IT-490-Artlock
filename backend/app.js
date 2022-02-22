const Server = require('./rabbitMQServer');
const fs = require('fs');

// Init data for the rabbitMQ connection
// This can be done in sync since all other server functions require this data
let mqData = JSON.parse(fs.readFileSync('rabbitMQ.json'));

console.log(Server);

let server = new Server(mqData);

server.run()
