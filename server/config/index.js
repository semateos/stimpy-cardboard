/**
* Dependencies.
*/
var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');

console.log('node env', process.env.NODE_ENV);

var config = {
    root: rootPath,
    host: '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 3000,
    api: '',
    hapi: {
        options: {
            views: {
                path: rootPath + '/server/views',
                engines: {
                    html: require('swig')
                }
            },
            cors: true
        }
    }
}

switch(process.env.NODE_ENV){
    
    case 'production':
    case 'cordova':

        config.api = 'http://localhost:3000'
        break;

}

config.env = process.env.NODE_ENV;

// Defaults that you can access when you require this config.
module.exports = config;