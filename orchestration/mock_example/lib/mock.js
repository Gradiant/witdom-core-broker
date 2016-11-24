'use strict';

var OrchestrationError = require('./mockError');

/**
 * Example orchestration connector
 * config: will be as defined in broker configuration, no processing will be applied
 */
function Connector()
{
    // Example data
    this.host;
    this.port;
    this.auth_token;
}

/**
 * Initializes the connection.
 * If authentication is required, should be done here
 */
Connector.prototype.connect = function(config, callback) {
    // Example configuration load
    this.host = config.host;
    this.port = config.port;
    this.auth_token = config.auth_token;
    this.base_name = "service";
    this.base_ip = "127.0.0.";
    callback(null); // no error
}


/**
 * Gets the information of the service identified by the given service name
 */
Connector.prototype.getServiceData = function(service, callback) {
    if(service != 'service1') {
        callback(new OrchestrationError(404, "Unknown service"), null)
        return;
    }
    var error = null;
    var service_data = {
            "image": "image_url",
            "host": this.base_ip + "1",
            "port": "1234",
            "description": "service_description"
        };
    callback(error, service_data);
};  

/**
 * Gets the information of all the services deployed
 * Depending on the service will take a wile, so the list will only be read at startup.
 */
Connector.prototype.getServiceList = function(callback) {
    var error = null;
    var services = [];
    for(var i=1; i< 10; i++) {
        var name = this.base_name + i;
        var ip = this.base_ip + i;
        services.push({
            "name": name,
            "image": "image_url",
            "host": ip,
            "port": "1234",
            "description": "service_description"
        });
    }
    callback(error, services);
};

var connector = module.exports = exports = new Connector;