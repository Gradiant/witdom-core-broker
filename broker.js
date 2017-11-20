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
var authHandler = require('./utils/authHandler');
var httpAuthValidator = require('./utils/httpAuthValidator');
var requestHeadersParser = require('./utils/requestHeadersParser');
var remoteIPHandler = require('./utils/remoteIPHandler');
var winston = require('winston');
var moment = require('moment');
global.__logger = new winston.Logger({
    level: __brokerConfig.logging_level || 'silly',
    transports: [
      new (winston.transports.Console)({
        timestamp: function() {
            return moment().format('DD-MM-YYYY HH:mm:ss.SSS');
        },
        formatter: function(options) {
            return winston.config.colorize(options.level,'[' + options.timestamp() + '] ' + options.level + ': ') + (options.message ? options.message : '');
        }
      }),
      new (winston.transports.File)({ filename: 'broker.log' })
    ]
});

global.__performanceLogger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            timestamp: function() {
                return moment().format('DD-MM-YYYY HH:mm:ss.SSS');
            },
            formatter: function(options) {
                return winston.config.colorize(options.level,'[' + options.timestamp() + '] [Broker] ' + (options.message ? options.message : ''));
            }  
        })
    ]
});

var bodyParser = require('body-parser');

var ursa = require('ursa');
var privatekey = ursa.createPrivateKey(fs.readFileSync(brokerConfig.https.broker_key), brokerConfig.https.broker_key_passphrase);

// Https server configuration
var httpsOptions = {
    //key: fs.readFileSync(brokerConfig.https.broker_key), 
    //passphrase: brokerConfig.https.broker_key_passphrase,
    key: privatekey.toPrivatePem(),
    cert: fs.readFileSync(brokerConfig.https.broker_cert), 
    //ca: [fs.readFileSync(brokerConfig.https.ca_cert), fs.readFileSync('CAs/untrustedCA/untrustedcacert.pem')],
    ca: [],
    requestCert: true, 
    rejectUnauthorized: false
};
for (const ca_cert of brokerConfig.https.ca_certs) {
    httpsOptions.ca.push(fs.readFileSync(ca_cert));
}
__brokerConfig.httpsOptions = httpsOptions;

var restCaller = require('./request/rest').Rest;

restCaller.init(httpsOptions);

var mongoose = require('mongoose');
var protection = require(brokerConfig.po_connector);
var protector = protection.Protector;

var protectorConfig = {
    protocol: __brokerConfig.protocol,
    po_id: __brokerConfig.po_id,
    numberOfRetries: __brokerConfig.numberOfRetries,
    basepath: __brokerConfig.po_basepath
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

// Database connection
mongoose.connect('mongodb://' + brokerConfig.database.host + ':' + brokerConfig.database.port + '/broker');

if (brokerConfig.testing) {
    //========TESTING==Clean database
    for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
    }
    //========TESTING================
}

// Setup the audit component
var auditLogExpress = undefined;
if (brokerConfig.audit.active == 'true') {
    var auditLog = require('audit-log');
    auditLog._debug = true;
    auditLog.addTransport("mongoose", {connectionString: 'mongodb://' + brokerConfig.audit.database.host + ':' + brokerConfig.audit.database.port + '/auditlog'});

    var auditLogExtendedExpress = require('./utils/auditLogExtendedExpress');
    var auditLogExpress = new auditLogExtendedExpress({
        auditLog: auditLog,
        blackListPaths:[/^\/docs.*$/,/^\/api-docs.*$/]
    });
}

// SwaggerRouter configuration
var options = {
    swaggerUi: '/swagger.json',
    controllers: './controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// TODO: Store basePath in configuration
//brokerConfig.basePath = swaggerDoc.basepath;

var bodyDumper           = require('./utils/bodyDumper')


// Orchestrator connection
var orchestrator = orchestration.Orchestrator;
orchestrator.connect(brokerConfig.orchestrator.config, function(error) {
    if(!error) {
        // Initialize the Swagger middleware
        swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

            // Too allow bigger bodys in the requests
            app.use(bodyParser.json({limit: '10mb',verify:function(req,res,buf){req.rawBody=buf}}));

            if (brokerConfig.testing) {
                // FIXME only for dev!!
                // This middleware accepts all HTTP request as if they were HTTPS request with a valid client certificate
                // avoiding the need of providing a valid token. This is only using for testing/integration purposes
                app.use(httpAuthValidator);
            }

            // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
            app.use(middleware.swaggerMetadata());

            // Register a client auth validator
            app.use(authHandler);

            // Validate Swagger requests
            app.use(middleware.swaggerValidator());

            // Dump body for request to 'request/callback'
            app.use(bodyDumper);

            // Put request HTTP headers in request.swagger.params.headers
            app.use(requestHeadersParser);

            // Put the remote ip in request.swagger.params.remote_ip
            app.use(remoteIPHandler);

            if (auditLogExpress != undefined) {
                // use audit-log express plugin middleware
                app.use(auditLogExpress.middleware);
            }

            // Route validated requests to appropriate controller
            app.use(middleware.swaggerRouter(options));
            
            // Serve the Swagger documents and Swagger UI
            app.use(middleware.swaggerUi());
                
            // Use error handler
            app.use(errorHandler);

            if (brokerConfig.testing) {
                // Start the server
                http.createServer(app).listen(brokerConfig.http.port, function () {
                    __logger.info('Your server is listening on port %d (http://localhost:%d)', brokerConfig.http.port, brokerConfig.http.port);
                    __logger.info('Swagger-ui is available on http://localhost:%d/docs', brokerConfig.http.port);
                });
            }

            // Start the https server
            https.createServer(httpsOptions,app).listen(brokerConfig.https.port, function () {
                __logger.info('Your server is listening on port %d (https://localhost:%d)', brokerConfig.https.port, brokerConfig.https.port);
                __logger.info('Swagger-ui is available on https://localhost:%d/docs', brokerConfig.https.port);
            });

            __logger.info("Broker initialized successfully");
        });
    }
});