class ResponseHandler {
    constructor(controller) {
        this.controller = controller;
    }

    error(err, msg) {
        return new Buffer(`{"Error ${err}":"${msg}"}`);
    }

    async handle(msg){
        let obj = JSON.parse(msg.content);
        if(obj.type) {
            return new Buffer(JSON.stringify(await this.controller[obj.type](obj)));
        }
        return this.error(404, 'No type was provided');
    }
}

module.exports =  ResponseHandler;
