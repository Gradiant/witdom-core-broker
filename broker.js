'use strict';

global.__base = __dirname + '/'; //Save the broker base directory
var app = require('connect')();
var http = require('http');
var https = require('https');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
global.__customConfigFile = process.argv[2] || 'config/custom.js';
if (__customConfigFile.charAt(0) != '/') {
    __customConfigFile = __base + __customConfigFile;
}
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
var errorHandler = require('./utils/errorHandler')
var clientAuthHandler = require('./utils/clientAuthHandler');
var authHandler = require('./utils/authHandler');
var httpAuthValidator = require('./utils/httpAuthValidator');
var requestHeadersParser = require('./utils/requestHeadersParser');
var winston = require('winston');
global.__logger = new winston.Logger({
    level: 'silly',
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'broker.log' })
    ]
});

var ursa = require('ursa');
var privatekey = ursa.createPrivateKey(fs.readFileSync(brokerConfig.https.broker_key), brokerConfig.https.broker_key_passphrase);

// Https server configuration
var httpsOptions = {
    //key: fs.readFileSync(brokerConfig.https.broker_key), 
    //passphrase: brokerConfig.https.broker_key_passphrase,
    key: privatekey.toPrivatePem(),
    cert: fs.readFileSync(brokerConfig.https.broker_cert), 
    ca: fs.readFileSync(brokerConfig.https.ca_cert),
    requestCert: true, 
    rejectUnauthorized: false
};
__brokerConfig.httpsOptions = httpsOptions;

var restCaller = require('./request/rest').Rest;

restCaller.init(httpsOptions);

var mongoose = require('mongoose');
var protection = require('./protection/po_connector');
var protector = protection.Protector;

var protectorConfig = {
    protocol: __brokerConfig.protocol,
    po_id: __brokerConfig.po_id,
    numberOfRetries: __brokerConfig.numberOfRetries
};

protector.connect(protectorConfig, function (error) {
    if (error) {
        console.log(error);
    }
});

// Safe load of orchestrator module from configuration
try {
    var orchestration = require(brokerConfig.orchestrator.name);
} catch(error) {
    throw 'Can not load orchestator module: ' + error;
}

var requestIp = require('request-ip');

// Database connection
mongoose.connect('mongodb://' + brokerConfig.database.host + ':' + brokerConfig.database.port);

//========TESTING==Clean database
for (var i in mongoose.connection.collections) {
    mongoose.connection.collections[i].remove(function() {});
}
//========TESTING================

// SwaggerRouter configuration
var options = {
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);


////// TODO Implement decryption of private key where required
/*var ursa = require('ursa');
var key = ursa.createPrivateKey(httpsOptions.key, httpsOptions.passphrase);
console.log(key.toPrivatePem().toString());
console.log(httpsOptions.key.toString());
httpsOptions.key = key.toPrivatePem();
httpsOptions.passphrase = '';*/



// Orchestrator connection
var orchestrator = orchestration.Orchestrator;
orchestrator.connect(brokerConfig.orchestrator.config, function(error) {
    if(!error) {
        // Initialize the Swagger middleware
        swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
            // Register the middleware that gets the client ip
            //app.use(requestIp.mw()) // Not needed now, was used for clientAuthHandler

            // Register a client auth validator
            //app.use(clientAuthHandler);

            // FIXME only for dev!!
            app.use(httpAuthValidator);

            // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
            app.use(middleware.swaggerMetadata());

            // Register a client auth validator
            //app.use(clientAuthHandler);
            app.use(authHandler);

            // Validate Swagger requests
            app.use(middleware.swaggerValidator());

            // Put request HTTP headers in request.swagger.params.headers
            app.use(requestHeadersParser);

            // Route validated requests to appropriate controller
            app.use(middleware.swaggerRouter(options));
            
            // Serve the Swagger documents and Swagger UI
            app.use(middleware.swaggerUi());
                
            // Use error handler
            app.use(errorHandler);

            // Start the server
            http.createServer(app).listen(brokerConfig.http.port, function () {
                console.log('Your server is listening on port %d (http://localhost:%d)', brokerConfig.http.port, brokerConfig.http.port);
                console.log('Swagger-ui is available on http://localhost:%d/docs', brokerConfig.http.port);
            });

            // Start the https server
            https.createServer(httpsOptions,app).listen(brokerConfig.https.port, function () {
                console.log('Your server is listening on port %d (https://localhost:%d)', brokerConfig.https.port, brokerConfig.https.port);
                console.log('Swagger-ui is available on https://localhost:%d/docs', brokerConfig.https.port);
            });

            __logger.info("Broker intialized successfully");
        });
    }
});