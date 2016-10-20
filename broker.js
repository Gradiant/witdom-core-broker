'use strict';

var app = require('connect')();
var http = require('http');
var https = require('https');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var errorHandler = require('./utils/errorHandler')
var serverPort = 5000;
var serverHttpsPort = 5043;

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
    key: fs.readFileSync('witdomCA/broker_key.pem'), 
    passphrase: 'W1td0mBr0k3r',
    cert: fs.readFileSync('witdomCA/broker_crt.pem'), 
    ca: fs.readFileSync('witdomCA/witdomcacert.pem'),
    requestCert: true, 
    rejectUnauthorized: true
};

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
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
    http.createServer(app).listen(serverPort, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
        console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    });

    // Start the https server
    https.createServer(httpsOptions,app).listen(serverHttpsPort, function () {
        console.log('Your server is listening on port %d (https://localhost:%d)', serverHttpsPort, serverHttpsPort);
        console.log('Swagger-ui is available on https://localhost:%d/docs', serverHttpsPort);
    });
});
