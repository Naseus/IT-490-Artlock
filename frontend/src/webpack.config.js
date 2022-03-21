NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    mode:'none',
    plugins:[
        new NodePolyfillPlugin()
    ]
}
