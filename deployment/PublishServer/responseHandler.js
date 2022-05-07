const Deploy = require('../models/deployModel.js')
const deploy = new Deploy();

class ResponseHandler {
    error(err, msg) {
        return Buffer.from(`{"status":${err}, "body":"${msg}"}`);
    }

    async handle(msg){
        let obj;
        try {
            obj = JSON.parse(msg.content);
            await deploy.createPackage(obj);
        } catch(e){
            return this.error(500, e);
        }

        let rtn = {"status":200, "body":"ok"};
        return Buffer.from(JSON.stringify(rtn));
    }
}

module.exports =  ResponseHandler;
