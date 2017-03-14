'use strict';

//var ServiceInfo = require('../service_info/ServiceInfo');
var ServiceInfo = require(__brokerConfig.serviceInfoModule);
var restCaller = require(__base + 'request/rest').Rest;

function RestHandler() {}

/**
 * Creates the REST call using the parameters given.
 * @param {object} service_data Object with the information about the service we are going to call.
 * @param {object} request_data Object with the information about the request we are going to do.
 * @param {string} request_id String with the request identifier on the database.
 * @param {function} callback (error, response) Callback function to call once the REST call is done.
 */
RestHandler.prototype.request = function(service_data, request_data, request_id, callback) {

    var service_id = request_data.request.service_name;
    
    // Arrange path
    var request_path = request_data.request.service_path || "";
    if(request_path.charAt(0) != '/') request_path = '/' + request_path;
    // URL generation
    var url =  __brokerConfig.protocol + "://" + service_data.details.uri + request_path;
    // HTTP method
    var method = request_data.request.method;
    // Get request headers and add broker callback header
    var headers = request_data.request.headers;
    headers['X-Broker-Callback-URL'] = '/request/callback?request_id=' + request_id;
    // Get body
    var body = request_data.request.body;

    __logger.silly("RestHandler.request: url: " + url);
    __logger.silly("RestHandler.request: method: " + method);
    __logger.silly("RestHandler.request: headers: " + JSON.stringify(headers));
    __logger.silly("RestHandler.request: body: " + body);

    //var retries = 10; // TODO, make configurable __brokerConfig.numberOfRetries
    restCaller.doCall(url, method, headers, body, __brokerConfig.numberOfRetries, function(error, response) {
        if(error) {
            if(error.code == 100) {
                
                __logger.warn("RestHandler.request: Unsuported method");
                __logger.debug("RestHandler.request: Trace:");
                __logger.debug(error);

                callback({code: 400, message: "unsuported method"}, null);

            } else if(error.code == 102) {

                __logger.error("RestHandler.request: RestCaller is not initialized");
                __logger.debug("RestHandler.request: Trace:");
                __logger.debug(error);

                callback({code: 500, message: "internal server error, misconfigured rest"}, null);

            } else if(error.code == 101) {

                __logger.warn("RestHandler.request: No response from service " + service_id);

                // If communication fails, we update service on database
                ServiceInfo.updateService(service_id, function(error, service) {
                    if(error) {

                        if(error.code == 404) {
                            __logger.error("RestHandler.request: Cannot find service " + service_id + " info");
                            __logger.debug("RestHandler.request: Trace:");
                            __logger.debug(error);

                            callback({code: 404, message: "Service not found"}, null);
                        } else {
                            __logger.error("RestHandler.request: Got error updating service " + service_id + " info");
                            __logger.debug("RestHandler.request: Trace:");
                            __logger.debug(error);

                            callback({code: 500, message: "internal server error, can not update database"}, null);
                        }

                    } else if(service) {
                        
                        __logger.debug("RestHandler.request: Updated service " + service_id + " info.");
                        // Regenerate URL
                        var url =  __brokerConfig.protocol + "://" + service.details.uri + request_path;
                        
                        restCaller.doCall(url, method, headers, body, __brokerConfig.numberOfRetries, function(error, response) {
                            if(error) {
                                __logger.error("RestHandler.request: Unknown error");
                                __logger.debug("RestHandler.request: Trace:");
                                __logger.debug(error); // TODO: check this, maybe change to just 'error'

                                callback({code: 503, message: "cannot reach service"}, null);

                            } else {
                                __logger.debug("RestHandler.request: Success on contacting with updated service " + service_id);

                                callback(null, response);
                            }
                        });
                    }
                });
            } else {
                __logger.error("RestHandler.request: Unknown error");
                __logger.debug("RestHandler.request: Trace:");
                __logger.debug(error);
                if (response) {
                    __logger.debug(response.status);
                    __logger.debug(response.text);
                    __logger.debug(response.body);
                }   

                callback({code: 500, message: "internal server error"}, null);
            }
        } else {
            __logger.debug("RestHandler.request: Success on contacting with service " + service_id);
            callback(null, response);
        }
    });
}

/**
 * Forwards the request to the given domain.
 * @param {object} domain_data Object with the information about the domain where we are going to forward the request to.
 * @param {object} request_data Object with the information about the request we are going to forward.
 * @param {string} request_id String with the request identifier on the database.
 * @param {function} callback (error, response) Callback function to call once the REST call is done.
 */
RestHandler.prototype.forwardRequest = function(domain_data, request_data, request_id, callback) {
    
    // URL generation
    var url = __brokerConfig.protocol + "://" + domain_data.domain_name + ":" + domain_data[__brokerConfig.protocol].port + '/v1/forward/domain';
    // HTTP method
    var method = 'POST';
    // Get request headers and add broker callback header
    var headers = {"content-type": "application/json"};
    // Forward body
    var body = {
        request_data: request_data.request.body,
        request_headers: request_data.request.headers,
        request_type: request_data.request.method,
        request_uri: request_data.request.service_path,
        service_name: request_data.request.service_name,
        request_id: request_id
    }
    
    //var retries = 10; // TODO, make configurable
    restCaller.doCall(url, method, headers, body, __brokerConfig.numberOfRetries, function(error, response) {
        if(error) {
            if(error.code == 102) {

                __logger.error("RestHandler.forwardRequest: RestCaller is not initialized");
                __logger.debug("RestHandler.forwardRequest: Trace:");
                __logger.debug(error);

                callback({code: 500, message: "internal server error, misconfigured rest"}, null);

            } else if(error.code == 101) {

                __logger.error("RestHandler.forwardRequest: Got error forwarding request " + request_id);
                __logger.debug("RestHandler.forwardRequest: Trace:");
                __logger.debug(response.error); // TODO: check this, maybe change to just 'error'

                callback({code: 503, message: "can not reach external domain"}, null);
            }// TODO: else for the rest of errors
        } else {
            __logger.debug("RestHandler.forwardRequest: Success on forwading request to external domain.");

            callback(null, response);
        }
    });
    
}

/**
 * Returns a forwarded request to its origin
 * @param {object} domain_data Object with the information about the domain where we are going to forward the callback to.
 * @param {object} request_data Object with the information about the request we are going to forward.
 * @param {string} request_id String with the request identifier on the database.
 * @param {function} callback (error, response) Callback function to call once the REST call is done.
 */
RestHandler.prototype.forwardCallback = function(domain_data, callback_data, request_id, callback) {
    
    // URL generation
    var url = __brokerConfig.protocol + "://" + domain_data.domain_name + ":" + domain_data[__brokerConfig.protocol].port + '/v1/forward/callback';
    // HTTP method
    var method = 'POST';
    // Get request headers and add broker callback header
    var headers = {"content-type": "application/json"};
    // Callback body
    var data = callback_data.response || callback_data.request;
    var body = {
        response_data: {
            data: data.body     //FIXME: This encapsulation allow us to pass both strings and JSON objects through swagger-tools midleware.
                                // The ideal solution is to allow this at swagger-tools level, but we can't do that right now.
        },
        response_headers: data.headers,
        response_status: data.status,
        request_id: request_id
    }
    
    //var retries = 10; // TODO, make configurable
    restCaller.doCall(url, method, headers, body, __brokerConfig.numberOfRetries, function(error, response) {
        if(error) {
            if(error.code == 102) {

                __logger.error("RestHandler.forwardCallback: RestCaller is not initialized");
                __logger.debug("RestHandler.forwardCallback: Trace:");
                __logger.debug(error);

                callback({code: 500, message: "internal server error, misconfigured rest"}, null);

            } else if(error.code == 101) {

                __logger.error("RestHandler.forwardCallback: Got error forwarding callback " + request_id);
                __logger.debug("RestHandler.forwardCallback: Trace:");
                __logger.debug(response.error); // TODO: check this, maybe change to just 'error'

                callback({code: 503, message: "can not reach external domain"}, null);
            }
        } else {
            __logger.debug("RestHandler.forwardCallback: Success on forwading request to external domain.");

            callback(null, response);
        }
    });
}

var restHandler = module.exports = exports = new RestHandler;