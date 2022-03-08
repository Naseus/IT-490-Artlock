class ResponseHandler {
    constructor(controller) {
        this.controller = controller;
    }

    error(err, msg) {
        return new Buffer(`{"Error ${err}":"${msg}"}`);
    }

    handle(msg){
        let obj = JSON.parse(msg.content);
        if(obj.type) {
            return new Buffer(JSON.stringify(this.controller[obj.type](obj)));
        }
        return this.error(404, 'No type was provided');
    }
}

module.exports =  ResponseHandler;
