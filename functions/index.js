'use strict';

//export all functions from the src folder
const glob = require("glob");
const files = glob.sync('./src/*.js', { cwd: __dirname, ignore: './node_modules/**'});
for(let f=0,fl=files.length; f<fl; f++){
    const file = files[f];
    let functionName = files[f];
    if(file.lastIndexOf("/") !== -1) {
        functionName = functionName.substr(functionName.lastIndexOf("/") + 1);
    }
    functionName = functionName.split(".")[0];
    if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName) {
        exports[functionName] = require(file);
    }
}