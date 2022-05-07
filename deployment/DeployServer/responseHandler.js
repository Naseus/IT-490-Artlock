class ResponseHandler {
    error(err, msg) {
        return Buffer.from(`{"status":${err}, "body":"${msg}"}`);
    }

    async handle(msg){
        let path = '../'
        let obj;
        try {
            obj = JSON.parse(msg.content);
        } catch(e){
            return this.error(500, e);
        }
        await fs.rm(path + obj.pkg_type, {recursive:true, force:'true'});
        await fs.mkdir(path + obj.pkg_type);
        for(let [file, content] of Object.entries(msg.files)){
            fs.open(path + file,'w', (err, f)=>{
                fs.write(f, content.toString(), (err, data)=>{
                    if(err) {
                        console.log(`Failed to write ${file}: ${err}`);
                    }
                });
            });
        }
        fs.write()

        let rtn = {"status":200, "body":"pkg saved"};
        return Buffer.from(JSON.stringify(rtn));
    }
}

module.exports =  ResponseHandler;
