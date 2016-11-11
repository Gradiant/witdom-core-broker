'use strict';

/**
 * Example orchestration connector
 * config: will be as defined in broker configuration, no processing will be applied
 */
function MockConnector(config)
{
    // Example configuration load
    this.host = config.host;
    this.port = config.port;
    this.auth_token = config.auth_token;
}

/**
 * Gets the information of the service identified by the given service name
 */
MockConnector.prototype.getServiceData = function(service, callback) {
    error = null;
    service_data = {host: 'localhost'};
    callback(error, service_data);
};  

/**
 * Gets the information of all the services deployed
 * Depending on the service will take a wile, so the list will only be read at startup.
 */
MockConnector.prototype.getServiceList = function(callback) {
    error = null;
    services = [];
    for(i=1; i< 10; i++) {
        ip = '127.0.0.' + i;
        services.push({host: ip});
    }
    callback(error, services);
};

module.exports = MockConnector;