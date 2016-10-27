'use strict';

var app = require('connect')();
var http = require('http');
var https = require('https');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var errorHandler = require('./utils/errorHandler')
var clientAuthHandler = require('./utils/clientAuthHandler');
var brokerConfig = require('./config');

var requestIp = require('request-ip');

// swaggerRouter configuration
var options = {
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

var httpsOptions = {
    key: fs.readFileSync(brokerConfig.https.broker_key), 
    passphrase: brokerConfig.https.broker_key_passphrase,
    cert: fs.readFileSync(brokerConfig.https.broker_cert), 
    ca: fs.readFileSync(brokerConfig.https.ca_cert),
    requestCert: true, 
    rejectUnauthorized: false
};

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    // Register the middleware that gets the client ip
    app.use(requestIp.mw())

    // Register a client auth validator
    app.use(clientAuthHandler);

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

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
});