class ResponseHandler {
    constructor(controller) {
        this.controller = controller;
    }

    error(err, msg) {
        return Buffer.from(`{"status":${err}, "body":"${msg}"}`);
    }

    async handle(msg){
        let obj = JSON.parse(msg.content);
        if(!(obj && obj.type)) {
            return this.error("message has no type");
        }

        if(obj.type) {
            let res = JSON.parse('{"status":200, "body":""}');
            try{
                res = JSON.stringify(await this.controller[obj.type](obj, res));
            }
            catch(e) {
                console.log(`Error ${e}`);
                return this.error(500, e);
            }
            console.log(`Response ${res}`);
            return Buffer.from(res);
        }
        return this.error(404, 'No type was provided');
    }
}

module.exports =  ResponseHandler;
