const  fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ResponseHandler {
    path = '/home/tdevries4i/';
    ensureDirectoryExistence(filePath) {
        let dirname = path.dirname(filePath);
        if (fs.existsSync(this.path + dirname)) {
            return true;
        }
        this.ensureDirectoryExistence(dirname);
        fs.mkdirSync(this.path + dirname);
    }

    error(err, msg) {
        return Buffer.from(`{"status":${err}, "body":"${msg}"}`);
    }

    async handle(msg){
        let obj;

        try {
            obj = JSON.parse(msg.content);
        } catch(e){
            return this.error(500, e);
        }
        try {
             fs.rmdirSync(path + obj.pkg_type, {recursive:true,});
        } catch(e){console.log(e);}
        for(let [file, content] of Object.entries(obj.files)){
            console.log(`Writing ${file}`);
            this.ensureDirectoryExistence(file);
            fs.open(this.path + file,'w', (err, f)=>{
                    if(err) {
                        console.log(`Failed to write ${file}: ${err}`);
                        return;
                    }
                fs.writeSync(f, Buffer.from(content.data).toString());
            });
        }
        let doActions = exec('sh actions.sh',
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
        console.log('done');

        let rtn = {"status":200, "body":"pkg saved"};
        return Buffer.from(JSON.stringify(rtn));
    }
}

module.exports =  ResponseHandler;
