'use strict';

var Request = require(__base + 'models/mongo/request');
var Service = require(__base + 'models/mongo/service');
var ServiceInfo = require(__base + 'service_info/ServiceInfo');
var protector = require(__base + 'protection/po_connector').Protector;
var RequestHandler = require('./requests');
var RestHandler = require('./rest');

/**
 * Manages the request flow, taking care of the service location and the database updates for
 * the requests and services, if needed.
 * Works asynchronously and does not provide any output, it only updates the database.
 */
ForwardingHandler.prototype.request = function(origin, request_data, callback) {

    __logger.debug("ForwardingHandler.request: new request");

    // Save request to database
    RequestHandler.createRequest(origin, request_data, function(error, request) {
        if(error) {

            __logger.error("ForwardingHandler.request: can not create request ");
            __logger.debug("ForwardingHandler.request: trace:");
            __logger.debug(error);

            callback(error, null);
        } else {

            __logger.debug("ForwardingHandler.request: new request");

            // Return request id and continue
            var request_id = request.id;
            callback(error, request_id);

            // Retrieve service from database
            var service_id = request_data.request.service_name;
            ServiceInfo.findWithLocation(service_id, function(error, service) {
                if(error) {
                    var code, message;
                    if(error.code == 404) {
                        __logger.warn("ForwardingHandler.request: Can not find service " + service_id);
                        __logger.silly("ForwardingHandler.request: Trace:");
                        __logger.silly(error);

                        code = 404;
                        message = "service not found";
                    } else {
                        __logger.warn("ForwardingHandler.request: Got error finding service " + service_id);
                        __logger.silly("ForwardingHandler.request: Trace:");
                        __logger.silly(error);

                        code = 500;
                        message = "internal server error, can not access database";
                    }

                    // If we get an error we update request and exit
                    self.updateRequest(request_id, 'FINISHED', {
                        response:{
                            service_name: request_data.request.service_name,
                            service_path: request_data.request.service_path,
                            status: code,
                            headers: {},
                            body: {
                                message: [{
                                    code: code.toString(),
                                    message: message,
                                    path:[]
                                }]
                            }
                        }
                    }, function(error) {});

                } else if(service) {
                    if(service.location == 'local') {

                        __logger.debug("ForwardingHandler.request: Found service " + service_id + " in local domain.");

                        RestHandler.request(request_data, request_id, function(error, response) {
                            if(error) {

                                __logger.debug("ForwardingHandler.request: Got error on request.");

                                // If we get an error, we finish the request with this error
                                RequestHandler.updateRequest(request_id, 'FINISHED', {
                                    response:{
                                        service_name: request_data.request.service_name,
                                        service_path: request_data.request.service_path,
                                        status: error.code,
                                        headers: {},
                                        body: {
                                            message: [{
                                                code: error.code.toString(),
                                                message: error.message,
                                                path:[]
                                            }]
                                        }
                                    }
                                }, function(error) {});
                            } else {

                                __logger.debug("ForwardingHandler.request: Successful request. Got status " + response.status + ".");

                                // If we got a response, we add it to the request log
                                var new_log = {
                                    response:{
                                        service_name: request_data.request.service_name,
                                        service_path: request_data.request.service_path,
                                        status: response.status,
                                        headers: response.headers,
                                        body: response.body
                                    }
                                };

                                if(response.status == 202) {
                                    // If the service responses with a 202 status, we asume that it will use callback
                                    var status = 'IN_PROGRESS';
                                    RequestHandler.updateRequest(request_id, status, new_log, function(error) {});
                                } else {
                                    // If the service uses anything else, we asume that the request is finished
                                    var status = 'FINISHED';
                                    RequestHandler.getRequest(request_id, function(error, request) {
                                        if(!error) {
                                            if(request.origin != 'local') {

                                                __logger.debug("ForwardingHandler.request: Returning resquest to original domain.");

                                                // If the request did not came from the local domain, we "forwardCallback" it
                                                var first_log = request.request_log[0];
                                                var original_id = first_log.request.original_id;
                                                RestHandler.forwardCallback(__brokerConfig.broker_ed, original_id, new_log, function(response) {
                                                    if(!response.status || response.status != 200) {
                                                        __logger.error("RestHandler.request: Error doing forward callback to origin");
                                                        __logger.debug("RestHandler.request: Trace:");
                                                        __logger.debug(response.error);
                                                    }
                                                    RequestHandler.deleteRequest(request_id, function(error) {});
                                                });
                                            } else {
                                                RequestHandler.updateRequest(request_id, status, new_log, function(error) {});
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    } else {

                        __logger.debug("ForwardingHandler.request: Found service " + service_id + " in external domain.");

                        // TODO, make this call configurable
                        protector.protect("/request/callback?request_id=" + request_id, service, request_data.request.headers, request_data.request.body, function(error, protectionResponse, finalCallParameters) {
                            if(error) {
                                __logger.error("ForwardingHandler.request: Got error protecting request " + request_id);
                                __logger.debug("ForwardingHandler.request: trace:");
                                __logger.debug(error);

                                // Error with PO communication
                                self.updateRequest(request_id, 'FINISHED', {
                                    response:{
                                        service_name: request_data.request.service_name,
                                        service_path: request_data.request.service_path,
                                        status: 503,
                                        headers: {},
                                        body: {
                                            message: [{
                                                code:"503",
                                                message: "can not reach protection service",
                                                path:[]
                                            }]
                                        }
                                    }
                                }, function(error) {});
                            } else if(protectionResponse) {
                                __logger.silly("ForwardingHandler.request: Protection process started.");
                                
                                // Update request and wait for callback
                                self.updateRequest(request_id, 'PROTECTING', {
                                    response:{
                                        service_name: request_data.request.service_name,
                                        service_path: request_data.request.service_path,
                                        status: 200,    // TODO, we could get status from protector
                                        headers: {},    // TODO, we could get headers from protector
                                        body: protectionResponse
                                    }
                                }, function(error) {});
                            } else if(finalCallParameters) {
                                __logger.silly("RequestForwardingHandler.doRequest: Protection process ended.");
                                
                                // Update body
                                request_data.request.body = finalCallParameters;
                                RestHandler.forwardRequest(domain_data, request_data, request_id, function(error, response) {
                                    if(error) {

                                        __logger.debug("ForwardingHandler.request: Got error forwarding request to external domain.");

                                        // If we get an error, we finish the request with this error
                                        RequestHandler.updateRequest(request_id, 'FINISHED', {
                                            response:{
                                                service_name: request_data.request.service_name,
                                                service_path: request_data.request.service_path,
                                                status: error.code,
                                                headers: {},
                                                body: {
                                                    message: [{
                                                        code: error.code.toString(),
                                                        message: error.message,
                                                        path:[]
                                                    }]
                                                }
                                            }
                                        }, function(error) {});
                                    } else {

                                        __logger.debug("ForwardingHandler.request: Success on forwarding request.");

                                        // If we got a response, we add it to the request log
                                        var new_log = {
                                            response:{
                                                service_name: request_data.request.service_name,
                                                service_path: request_data.request.service_path,
                                                status: response.status,
                                                headers: response.headers,
                                                body: response.body
                                            }
                                        };

                                        if(response.status == 202) {
                                            // If the service responds a 202 status, we asume that it will use callback
                                            var status = 'FORWARDED';
                                            RequestHandler.updateRequest(request_id, status, new_log, function(error) {});
                                        } else {
                                            // If the service uses anything else, we asume that the request is finished
                                            var status = 'FINISHED';
                                            RequestHandler.updateRequest(request_id, status, new_log, function(error) {});
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}

/**
 * Updates the status of the request and makes the needed calls according to callback parameters 
 */
ForwardingHandler.prototype.requestCallback = function(request_id, callback_headers, callback_body, callback) {
    
    var self = this;
    // Get request from database
    RequestHandler.getRequest(request_id, function(error, request) {
        if(error) {
            callback(error);
        } else if(!request) {
            // FIXME, not proper way to pass errors
            callback({name: "CastError", message: "request not found"})
        } else {

            __logger.debug("ForwardingHandler.request: Received callback for request " + request_id);
            __logger.silly("ForwardingHandler.request: Request.origin: " + request.origin);
            __logger.silly("ForwardingHandler.request: Request.status: " + request.status);

            // Return control and continue on background
            callback(null);
            //==================================================

            if(request.origin != 'local') {
                //Return request to origin domain
                var first_log = request.request_log[0];
                var original_id = first_log.request.original_id;
                var origin = __brokerConfig.broker_ed; // TODO get origin data
                var callback_data = {
                    request: {
                        service_name: first_log.request.service_name,
                        service_path: first_log.request.service_path,
                        status: 200,
                        headers: callback_headers,
                        body: callback_body
                    }
                }
                self.doForwardCallback(origin, original_id, callback_data, function(response) {
                    // For now we asume that if it fails we can not do anything, so we simply delete de request in the database
                    self.deleteRequest(request_id, function(error) {});
                });
            } else if(request.status == 'PROTECTING') {
                // Protection process finished
                var first_log = request.request_log[0];
                var originalCallParameters = first_log.request.body;
                var receivedCallParameters = callback_body;
                // Change data and forward request
                protector.endProtection(originalCallParameters, receivedCallParameters, function(error, finalCallParameters) {
                    if(error) {
                        self.updateRequest(request_id, 'FINISHED', {
                            response: {
                                service_name: first_log.request.service_name,
                                service_path: first_log.request.service_path,
                                status: 500,
                                headers: {},
                                body: {
                                    message: [{
                                        code:"500",
                                        message: "internal server error, can not end protection process",
                                        path:[]
                                    }]
                                }
                            }
                        });
                    } else {
                        __logger.silly("ForwardingHandler.doCallback: first_log:");
                        __logger.silly(JSON.stringify(first_log,null,2));
                        //var request_data = first_log.request;
                        var request_data = first_log;
                        //request_data.body = finalCallParameters;
                        request_data.request.body = finalCallParameters;
                        // TODO, domain data
                        __logger.silly("ForwardingHandler.doCallback: request_data:");
                        __logger.silly(JSON.stringify(request_data,null,2));
                        self.doForwardRequest(__brokerConfig.broker_ed, request_id, request_data, function(response) {
                            if(!response.status) {
                                __logger.warn("ForwardingHandler.doCallback: Got error forwarding request " + request_id);
                                __logger.debug("ForwardingHandler.doCallback: Trace:");
                                __logger.debug(response.error);
                                // Error communicating with UD broker
                                self.updateRequest(request_id, 'FINISHED', {
                                    response:{
                                        service_name: request_data.request.service_name,
                                        service_path: request_data.request.service_path,
                                        status: 503,
                                        headers: {},
                                        body: {
                                            message: [{
                                                code:"503",
                                                message: "can not reach untrusted domain",
                                                path:[]
                                            }]
                                        }
                                    }
                                }, function(error) {});
                            } else {
                                __logger.silly("ForwardingHandler.doCallback: forwading process started.");
                                var status;
                                if(response.status == 202) {
                                    status = 'FORWARDED';
                                } else {
                                    status = 'FINISHED';
                                }
                                // Successful request forwading
                                self.updateRequest(request_id, status, {
                                    response:{
                                        service_name: request_data.request.service_name,
                                        service_path: request_data.request.service_path,
                                        status: response.status,
                                        headers: response.headers,
                                        body: response.body
                                    }
                                }, function(error) {});
                            }
                        });
                    }
                });
            } else if(request.status == 'UNPROTECTING') {
                // Unprotection process finished
                var last_response_log = request.request_log[request.request_log.length - 2];    // FIXME, this does not look like a proper way to recover last response
                var first_log = request.request_log[0];
                var originalCallParameters = last_response_log.response.body;
                var receivedCallParameters = callback_body;
                // Change data and end request
                protector.endUnprotection(originalCallParameters, receivedCallParameters, function(error, finalCallParameters) {
                    if(error) {
                        self.updateRequest(request_id, 'FINISHED', {
                            response: {
                                service_name: first_log.request.service_name,
                                service_path: first_log.request.service_path,
                                status: 500,
                                headers: {},
                                body: {
                                    message: [{
                                        code:"500",
                                        message: "internal server error, can not end unprotection process",
                                        path:[]
                                    }]
                                }
                            }
                        });
                    } else {
                        self.updateRequest(request_id, 'FINISHED', {
                            response: {
                                service_name: first_log.request.service_name,
                                service_path: first_log.request.service_path,
                                status: 200,
                                headers: last_response_log.response.headers,
                                body: finalCallParameters
                            }
                        }, function(error) {});
                    }
                });
            } else if(request.status == 'IN_PROGRESS') {
                if (__logger) {
                    __logger.info("Received callback for request " + request_id + ", and it has finished");
                }
                // Local request finished
                var first_log = request.request_log[0];
                self.updateRequest(request_id, 'FINISHED', {
                    response: {
                        service_name: first_log.request.service_name,
                        service_path: first_log.request.service_path,
                        status: 200,    // TODO, there is some way to get status from service?
                        headers: callback_headers,
                        body: callback_body
                    }
                }, function(error) {});
            }
        }
    });
}

/**
 * Manages the request flow of a request forwarded from other domain, taking care of the service
 * location and the database updates for the requests and services, if needed.
 * Works asynchronously and does not provide any output, it only updates the database.
 */
ForwardingHandler.prototype.forward = function(request_id, request_data) {

}

/**
 * Updates the status of the request and makes the needed calls according to callback parameters 
 */
ForwardingHandler.prototype.forwardCallback = function(callback_body, callback) {
    
    var self = this;
    callback_body.response_data = callback_body.response_data.data;   //FIXME, this is a nhapa 
    // Get request
    self.getRequest(callback_body.request_id, function(error, request) {
        if(error) {
            callback(error, null);
        } else if(!request) {
            callback({name: "CastError", message: "Can not find request"});
        } else {
            // Got request
            if(request.status != 'FORWARDED') {
                // Non consistent request
                callback({name: "CastError", message: "Can not find request"});
            } else {
                // Found consistent request, return OK
                callback(null);
                var first_log = request.request_log[0];

                // Don't call unprotect if callback_body.response_status != 2xx
                if (callback_body.response_status >= 300) { //TODO, check the codes
                    self.updateRequest(callback_body.request_id, 'FINISHED', {
                        response:{
                            service_name: first_log.request.service_name,
                            service_path: first_log.request.service_path,
                            status: callback_body.response_status,
                            headers: {},
                            body: callback_body.response_data
                        }
                    }, function(error) {});
                } else {
                    ServiceInfo.findWithLocation(first_log.request.service_name, function(error, service) {
                        if(error) {
                            // Weird error finding service
                            self.updateRequest(callback_body.request_id, 'FINISHED', {
                                response:{
                                    service_name: first_log.request.service_name,
                                    service_path: first_log.request.service_path,
                                    status: 500,
                                    headers: {},
                                    body: {
                                        message: [{
                                            code:"500",
                                            message: "undefined",
                                            path:[]
                                        }]
                                    }
                                }
                            }, function(error) {});
                        } else {
                            // TODO, broker callback url
                            __logger.silly("ForwardingHandler.doForwardedCallback: Received body:");
                            __logger.silly(JSON.stringify(callback_body, null, 2));
                            self.getRequest(callback_body.request_id, function(error, request) {
                                if(error) {
                                    callback(error);
                                } else {
                                    var first_log = request.request_log[0];
                                    var token = first_log.request.headers['X-Auth-Token'] || first_log.request.headers['x-auth-token'];
                                    if (token) {
                                        callback_body.response_headers['X-Auth-Token'] = token;
                                        __logger.silly("ForwardingHandler.doForwardedCallback: token retrieved from first log and saved in response headers:");
                                        __logger.silly(JSON.stringify(callback_body.response_headers, null, 2));
                                    }
                                    protector.unprotect("/request/callback?request_id=" + callback_body.request_id, service, callback_body.response_headers, callback_body.response_data, function(error, protectionResponse, finalCallParameters) {
                                        if(error) {
                                            // Error with PO communication
                                            self.updateRequest(callback_body.request_id, 'FINISHED', {
                                                response:{
                                                    service_name: first_log.request.service_name,
                                                    service_path: first_log.request.service_path,
                                                    status: 503,
                                                    headers: {},
                                                    body: {
                                                        message: [{
                                                            code:"503",
                                                            message: "can not reach protection service",
                                                            path:[]
                                                        }]
                                                    }
                                                }
                                            }, function(error) {});
                                        } else if(protectionResponse) {
                                            // Protection in progress
                                            self.updateRequest(callback_body.request_id, 'UNPROTECTING', {
                                                response:{
                                                    service_name: first_log.request.service_name,
                                                    service_path: first_log.request.service_path,
                                                    status: 200,    // TODO, we could get status from protector
                                                    headers: {},    // TODO, we could get headers from protector
                                                    body: protectionResponse
                                                }
                                            }, function(error) {});
                                        } else if(finalCallParameters) {
                                            // Protection ended
                                            self.updateRequest(callback_body.request_id, 'FINISHED', {
                                                response:{
                                                    service_name: first_log.request.service_name,
                                                    service_path: first_log.request.service_path,
                                                    status: callback_body.response_status,
                                                    headers: callback_body.response_headers,
                                                    body: finalCallParameters,
                                                }
                                            }, function(error) {});
                                        }
                                    });
                                    
                                }
                            });
                                
                        }
                    });

                }

                
                
                
            }
        }
    });
}