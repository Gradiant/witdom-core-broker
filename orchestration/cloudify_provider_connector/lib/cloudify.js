'use strict';

var unirest = require('unirest');
var OrchestrationError = require('./cloudifyError');
var fs = require('fs');

/**
 * Cloudify orchestration connector
 */
function Connector()
{
    // Data
    this.protocol;
    this.host;
    this.port;
    this.auth_token;
    this.ca;
    this.certificate_key;
    this.certificate;
}

/**
 * Initializes the connection.
 * config: will be as defined in broker configuration, no processing will be applied
 */
Connector.prototype.connect = function(config, callback) {
    // Configuration load
    this.protocol = config.protocol;
    this.host = config.host;
    this.port = config.port;
    this.auth_token = config.auth_token;
    try {
        this.ca = fs.readFileSync(config.ca);
        this.certificate_key = fs.readFileSync(config.certificate_key);
        this.certificate = fs.readFileSync(config.certificate);
        callback(null); // no error
    } catch (error) {
        callback(error);
    }
}

/**
 * Gets the information of the service identified by the given service name
 */
Connector.prototype.getServiceData = function(service, callback) {

    var given_name = service;
    var url = this.protocol + '://' + this.host + ':' + this.port + '/api/v2/deployments';
    unirest.options({
            ca: this.ca,
            key: this.certificate_key,
            cert: this.certificate
        });
    unirest.get(url)
        .end(function(response) {
            if(response.status != 200) {
                callback(new OrchestrationError(response.status, response.error), null);
            } else {
                for(var index in response.body.items) {
                    var deployment = response.body.items[index];
                    var outputs = deployment.outputs;
                    if(outputs && outputs.endpoints) {
                        var services = outputs.endpoints;
                        for(var index in services) {
                            var service = services[index];
                            if(service.name == given_name && service.host && service.port ) {
                                try {
                                    var service_data = {
                                        name: service.name,
                                        image: service.image || "",
                                        host: service.host,
                                        port: service.port,
                                        description: service.description || ""};
                                } catch (error) {
                                    continue;
                                }
                                callback(null, service_data);
                            }
                        }
                    }
                }
                callback(new OrchestrationError(404, "Unknown service"), null);
            }
        });
};  

/**
 * Gets the information of all the services deployed
 */
Connector.prototype.getServiceList = function(callback) {
    
    var serviceList = [];

    var url = this.protocol + '://' + this.host + ':' + this.port + '/api/v2/deployments';
    unirest.options({
            ca: this.ca,
            key: this.certificate_key,
            cert: this.certificate
        });
    unirest.get(url)
        .end(function(response) {
            if(response.status != 200) {
                callback(new OrchestrationError(response.status, response.error), null);
            } else {
                for(var index in response.body.items) {
                    var deployment = response.body.items[index];
                    var outputs = deployment.outputs;
                    if(outputs && outputs.endpoints) {
                        var services = outputs.endpoints;
                        for(var index in services) {
                            var service = services[index];
                            if(service.name) {
                                if(service.name && service.host && service.port) {
                                    try {
                                        serviceList.push({
                                            name: service.name,
                                            image: service.image || "",
                                            host: service.host,
                                            port: service.port,
                                            description: service.description || ""});
                                    } catch (error) {
                                        continue;
                                    }
                                } else {
                                    continue;
                                }
                            }
                        }
                    }
                }
                callback(null, serviceList);
            }
        });
};

var connector = module.exports = exports = new Connector;