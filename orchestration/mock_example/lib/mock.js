'use strict';

var OrchestrationError = require('./mockError');

/**
 * Example orchestration connector
 * config: will be as defined in broker configuration, no processing will be applied
 */
function Connector()
{
    // Example data
    this.services;
}

/**
 * Initializes the connection.
 * If authentication is required, should be done here
 */
Connector.prototype.connect = function(config, callback) {
    // Example configuration load
    this.services = config.services;
    callback(null); // no error
}


/**
 * Gets the information of the service identified by the given service name
 */
Connector.prototype.getServiceData = function(service, callback) {
    if(this.services[service]) {
        var service_data = {
            "image": "image_url",
            "host": this.services[service].host,
            "port": this.services[service].port,
            "description": "service_description"
        };
        callback(null, service_data);
    } else {
        callback(new OrchestrationError(404, "Unknown service"), null)
        return;
    }
};  

/**
 * Gets the information of all the services deployed.
 */
Connector.prototype.getServiceList = function(callback) {
    var services_response = [];
    var names = Object.keys(this.services);
    for(var index in names) {
        services_response.push({
            "name": names[index],
            "image": "image_url",
            "host": this.services[names[index]].host,
            "port": this.services[names[index]].port,
            "description": "service_description"
        });
    }
    callback(null, services_response)
};

var connector = module.exports = exports = new Connector;