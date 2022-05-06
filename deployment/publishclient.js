const RmqClient = require('./rmq/rabbitMQClient');
const RmqData = require('./rmq/rabbitMQ');
const rmqClient = new RmqClient(RmqData);

const fs = require("fs");
const dirname ='../';
let data = {};

console.log(process.argv.length);
if(process.argv.length !== 4){
	throw "Error in getting argument"
}

data['pkg_name'] = process.argv[3];
data['pkg_type'] = process.argv[2];
data['files'] = {};

function getFilesSync(fPath, ignore, response) {
  if (!response) { response = {}; }
  if (!ignore) { ignore = []; }

  let files = fs.readdirSync(dirname+fPath);
  for (let i = 0; i < files.length; i++) {
    let file_name = fPath+"/"+files[i];
    if (fs.statSync(dirname+file_name).isDirectory()) {
      let ign = false;
      for (let j = 0; j < ignore.length; j++) {
        if (ignore[j] == files[i]) {
          ign = true;
          break;
        }
      }
      if (!ign) {
        response = Object.assign(getFilesSync(file_name, ignore, response));
      }
    } else {
      response[file_name] = fs.readFileSync(dirname+file_name);
    }
  }
  return response;
}

data['files'] = getFilesSync(data['pkg_type'],["node_modules", ""]);
console.log(data);

rmqClient.sendData(data, 'publish');
