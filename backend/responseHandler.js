class ResponseHandler {
    constructor(controller) {
        this.controller = controller;
    }

    error(err, msg) {
        return new Buffer(`{"status:${err}", body:"${msg}"}`);
    }

    async handle(msg){
        let obj = JSON.parse(msg.content);
        if(!(obj && obj.type)) {
            return this.error("message has no type");
        }

        if(obj.type) {
            let res = JSON.parse('{"status":200, "body":""}');
            res = JSON.stringify(await this.controller[obj.type](obj, res));
            console.log(res);
            return new Buffer(res);
        }
        return this.error(404, 'No type was provided');
    }
}

module.exports =  ResponseHandler;
