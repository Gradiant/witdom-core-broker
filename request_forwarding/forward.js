'use strict';

var Request = require(__base + 'models/mongo/request');
var Service = require(__base + 'models/mongo/service');
//var ServiceInfo = require(__base + 'service_info/ServiceInfo');
var ServiceInfo = require(__brokerConfig.serviceInfoModule);
//var protector = require(__base + 'protection/po_connector').Protector;
var protector = require(__base + __brokerConfig.po_connector).Protector;
var RequestHandler = require('./requests');
var RestHandler = require('./rest');

function ForwardingHandler() {}

/**
 * Manages the request flow, taking care of the service location and the database updates for
 * the requests and services, if needed.
 * Works asynchronously and does not provide any output, it only updates the database.
 * @param {object} request_data with the data for the request
 * @param {function} callback (error, request_id) Callback with the error or the ID for the new request generated
 */
ForwardingHandler.prototype.request = function(request_data, callback) {

    var origin = 'local';

    // Save request to database
    RequestHandler.createRequest(origin, request_data, function(error, request) {
        if(error) {

            __logger.error("ForwardingHandler.request: can not create request ");
            __logger.debug("ForwardingHandler.request: trace:");
            __logger.debug(error);

            callback(error, null);
        } else {

            __logger.debug("ForwardingHandler.request: new request with id " + request.id);

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
                    RequestHandler.updateRequest(request_id, 'FINISHED', {
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

                        RestHandler.request(service, request_data, request_id, function(error, response) {
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

                                // If the service responses with a 202 status, we asume that it will use callback
                                if(response.status == 202) var status = 'IN_PROGRESS';
                                // If the service uses anything else, we asume that the request is finished
                                else var status = 'FINISHED';

                                RequestHandler.updateRequest(request_id, status, new_log, function(error) {});
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
                                RequestHandler.updateRequest(request_id, 'FINISHED', {
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
                                RequestHandler.updateRequest(request_id, 'PROTECTING', {
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

                                RestHandler.forwardRequest(__brokerConfig['broker_ed'], request_data, request_id, function(error, response) {
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
 * Works mostly asynchronously and does not provide any output unless the request_id is not correct,
 * in other case it only updates the database.
 * @param {string} request_id String with the ID for the request which is being answered
 * @param {object} callback_headers Object with the headers of the "response"
 * @param {object} callback_body Object with the body of the "response"
 * @param {function} callback (error) Callback with the error or null if the request_id is correct
 */
ForwardingHandler.prototype.requestCallback = function(request_id, callback_headers, callback_body, callback) {
    // Get request from database
    RequestHandler.getRequest(request_id, function(error, request) {
        if(error) {
            
            __logger.error("ForwardingHandler.requestCallback: Got error finding request " + request_id);
            __logger.debug("ForwardingHandler.requestCallback: Trace ");
            __logger.debug("ForwardingHandler.requestCallback:" + error);

            callback(error);

        } else if(!request) {

            __logger.warn("ForwardingHandler.requestCallback: Can not find request " + request_id);
            __logger.debug("ForwardingHandler.requestCallback: Trace ");
            __logger.debug("ForwardingHandler.requestCallback:" + error);

            // FIXME, not proper way to pass errors
            callback({name: "CastError", message: "request not found"});

        } else {

            __logger.debug("ForwardingHandler.requestCallback: Received callback for request " + request_id);
            __logger.silly("ForwardingHandler.requestCallback: Request.origin: " + request.origin);
            __logger.silly("ForwardingHandler.requestCallback: Request.status: " + request.status);

            // Return control and continue on background
            callback(null);

            if(request.status == 'PROTECTING') {

                __logger.debug("ForwardingHandler.requestCallback: Request is in PROTECTING state.");

                // Protection process finished
                var first_log = request.request_log[0];
                var originalCallParameters = first_log.request.body;
                var receivedCallParameters = callback_body;

                // Change data and forward request
                protector.endProtection(originalCallParameters, receivedCallParameters, function(error, finalCallParameters) {
                    if(error) {

                        __logger.error("ForwardingHandler.requestCallback: Got error ending body transformation.");
                        __logger.debug("ForwardingHandler.requestCallback: Trace:");
                        __logger.debug(error);

                        RequestHandler.updateRequest(request_id, 'FINISHED', {
                            response: {
                                service_name: first_log.request.service_name,
                                service_path: first_log.request.service_path,
                                status: 500,
                                headers: {},
                                body: {
                                    message: [{
                                        code:"500",
                                        message: "internal server error, can not end body transformation process",
                                        path:[]
                                    }]
                                }
                            }
                        }, function(error) {});
                    } else {
                        // Continue the request forwarding
                        __logger.debug("ForwardingHandler.requestCallback: Successful body transformation, resuming forwarding process.");

                        // Update body
                        var request_data = first_log;
                        request_data.request.body = finalCallParameters;

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
                                RequestHandler.updateRequest(request_id, 'FINISHED', {
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

                                    __logger.debug("ForwardingHandler.requestCallback: Found service " + service_id + " in local domain.");

                                    RestHandler.request(service, request_data, request_id, function(error, response) {
                                        if(error) {

                                            __logger.debug("ForwardingHandler.requestCallback: Got error on request.");

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

                                            __logger.debug("ForwardingHandler.requestCallback: Successful request. Got status " + response.status + ".");

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

                                            // If the service responses with a 202 status, we asume that it will use callback
                                            if(response.status == 202) var status = 'IN_PROGRESS';
                                            // If the service uses anything else, we asume that the request is finished
                                            else var status = 'FINISHED';

                                            RequestHandler.updateRequest(request_id, status, new_log, function(error) {});
                                        }
                                    });
                                } else {
                                    
                                    __logger.debug("RequestForwardingHandler.requestCallback: Forwarding request " + request_id + " to external domain.");
                                    
                                    RestHandler.forwardRequest(__brokerConfig['broker_ed'], request_data, request_id, function(error, response) {
                                        if(error) {

                                            __logger.debug("ForwardingHandler.requestCallback: Got error forwarding request to external domain.");

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

                                            __logger.debug("ForwardingHandler.requestCallback: Success on forwarding request.");

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
                            }
                        });
                    }
                });
            } else if(request.status == 'UNPROTECTING') {

                __logger.debug("ForwardingHandler.requestCallback: Request is in UNPROTECTING state.");

                // Recover original response
                var last_response_log = request.request_log[request.request_log.length - 2];    // Substract 1 for the last element (request) in the array and another for the last response.
                                                                                                // FIXME, this does not look like a proper way to recover last response
                var originalResponseParameters = last_response_log.response.body;
                var receivedResponseParameters = callback_body;
                // Change data and end request
                protector.endUnprotection(originalResponseParameters, receivedResponseParameters, function(error, finalCallParameters) {
                    if(error) {

                        __logger.error("ForwardingHandler.requestCallback: Got error ending body un-transformation.");
                        __logger.debug("ForwardingHandler.requestCallback: Trace:");
                        __logger.debug(error);

                        RequestHandler.updateRequest(request_id, 'FINISHED', {
                            response: {
                                service_name: last_response_log.response.service_name,
                                service_path: last_response_log.response.service_path,
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

                        __logger.debug("ForwardingHandler.requestCallback: Successful body un-transformation.");

                        // Update body
                        var response_data = last_response_log;
                        response_data.response.body = finalCallParameters;

                        if(request.origin == 'local') {

                            __logger.debug("ForwardingHandler.requestCallback: Updating local request.");

                            RequestHandler.updateRequest(request_id, 'FINISHED', {
                                response: {
                                    service_name: last_response_log.response.service_name,
                                    service_path: last_response_log.response.service_path,
                                    status: 200,
                                    headers: last_response_log.response.headers,
                                    body: finalCallParameters
                                }
                            }, function(error) {});

                        } else {

                            __logger.debug("ForwardingHandler.requestCallback: Forwarding external request.");
                                    
                            RestHandler.forwardCallback(__brokerConfig['broker_ed'], response_data, request_id, function(error, response) {
                                if(error) {
                                    __logger.error("ForwardingHandler.requestCallback: Got error forwarding callback to external domain.");
                                    __logger.debug("ForwardingHandler.requestCallback: Trace:");
                                    __logger.debug("ForwardingHandler.requestCallback: " + error);
                                }
                                RequestHandler.deleteRequest(request_id, function(error) {});
                            });
                        }
                    }
                });
            } else if(request.status == 'IN_PROGRESS') {
                
                __logger.debug("ForwardingHandler.requestCallback: Request is in IN_PROGRESS state, finishing.");
                
                // Request finished
                var first_log = request.request_log[0];
                var original_id = first_log.request.original_id;

                // Update data
                var callback_data = {
                    response: {
                        service_name: first_log.request.service_name,
                        service_path: first_log.request.service_path,
                        status: 200,
                        headers: callback_headers,
                        body: callback_body
                    }
                };

                // TODO, we should check if an unprotection process is needed

                if(request.origin == 'local') {

                    __logger.debug("ForwardingHandler.requestCallback: Updating local request.");

                    RequestHandler.updateRequest(request_id, 'FINISHED', callback_data, function(error) {});
                } else {

                    __logger.debug("ForwardingHandler.requestCallback: Forwarding external request.");
                            
                    //RestHandler.forwardCallback(__brokerConfig['broker_ed'], callback_data, request_id, function(error, response) {
                    RestHandler.forwardCallback(__brokerConfig['broker_ed'], callback_data, original_id, function(error, response) {
                        if(error) {
                            __logger.error("ForwardingHandler.requestCallback: Got error forwarding callback to external domain.");
                            __logger.debug("ForwardingHandler.requestCallback: Trace:");
                            __logger.debug("ForwardingHandler.requestCallback: " + error);
                        }
                        RequestHandler.deleteRequest(request_id, function(error) {});
                    });
                }
            }
        }
    });
}

/**
 * Manages the request flow of a request forwarded from other domain, taking care of the service
 * location and the database updates for the requests and services, if needed.
 * Works asynchronously and does not provide any output, it only updates the database.
 * @param {string} origin String with the name of the domain who originates the request.
 * @param {object} request_data Object with the data for the request.
 * @param {function} callback (error, request_id) Callback with the error or the generated ID for the new request.
 */
ForwardingHandler.prototype.forward = function(origin, request_data, callback) {

    var original_id = request_data.request.original_id;
    
    // Save request to database
    RequestHandler.createRequest(origin, request_data, function(error, request) {
        if(error) {

            __logger.error("ForwardingHandler.forward: can not create request ");
            __logger.debug("ForwardingHandler.forward: trace:");
            __logger.debug(error);

            callback(error, null);
        } else {

            __logger.debug("ForwardingHandler.forward: new external request");

            // Return request id and continue
            var request_id = request.id;
            callback(error, request_id);

            // Retrieve service from database
            var service_id = request_data.request.service_name;
            ServiceInfo.findWithLocation(service_id, function(error, service) {
                if(error) {
                    var code, message;
                    if(error.code == 404) {
                        __logger.warn("ForwardingHandler.forward: Can not find service " + service_id);
                        __logger.silly("ForwardingHandler.forward: Trace:");
                        __logger.silly(error);

                        code = 404;
                        message = "service not found";
                    } else {
                        __logger.warn("ForwardingHandler.forward: Got error finding service " + service_id);
                        __logger.silly("ForwardingHandler.forward: Trace:");
                        __logger.silly(error);

                        code = 500;
                        message = "internal server error, can not access database";
                    }

                    // Error response body
                    var new_log = {
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
                    };

                    // If we get an error, we must call external broker
                    RestHandler.forwardCallback(__brokerConfig['broker_ed'], new_log, original_id, function(error, response) {
                        if(error || response.status != 200) {
                            __logger.error("RestHandler.forward: Error doing forward callback to origin");
                            __logger.debug("RestHandler.forward: Trace:");
                            __logger.debug(response.error || error); // TODO: check this, maybe change to just 'error'
                        }
                        RequestHandler.deleteRequest(request_id, function(error) {});
                    });

                } else if(service) {
                    if(service.location == 'local') {

                        __logger.debug("ForwardingHandler.forward: Found service " + service_id + " in local domain.");

                        RestHandler.request(service, request_data, request_id, function(error, response) {
                            if(error) {

                                __logger.debug("ForwardingHandler.request: Got error on request.");

                                // Error response body
                                var new_log = {
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
                                };

                                // If we get an error, we must call external broker
                                RestHandler.forwardCallback(__brokerConfig['broker_ed'], new_log, original_id, function(error, response) {
                                    if(error || response.status != 200) {
                                        __logger.error("RestHandler.forward: Error doing forward callback to origin");
                                        __logger.debug("RestHandler.forward: Trace:");
                                        __logger.debug(response.error || error); // TODO: check this, maybe change to just 'error'
                                    }
                                    RequestHandler.deleteRequest(request_id, function(error) {});
                                });

                            } else {

                                __logger.debug("ForwardingHandler.forward: Successful request. Got status " + response.status + ".");

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
                                    // If the service uses anything else, we asume that the request is finished and we call external broker
                                    var status = 'FINISHED';

                                    __logger.debug("ForwardingHandler.forward: Returning request to original domain.");

                                    // Return to original domain
                                    RestHandler.forwardCallback(__brokerConfig['broker_ed'], new_log, original_id, function(error, response) {
                                        if(error || response.status != 200) {
                                            __logger.error("RestHandler.forward: Error doing forward callback to origin");
                                            __logger.debug("RestHandler.forward: Trace:");
                                            __logger.debug(response.error); // TODO: check this, maybe change to just 'error'
                                        }
                                        RequestHandler.deleteRequest(request_id, function(error) {});
                                    });
                                }
                            }
                        });
                    } else {

                        __logger.error("ForwardingHandler.forward: Can not find service " + service_id + " in local domain.");

                        // Error response body
                        var new_log = {
                            response:{
                                service_name: request_data.request.service_name,
                                service_path: request_data.request.service_path,
                                status: 404,
                                headers: {},
                                body: {
                                    message: [{
                                        code: "404",
                                        message: "service not found",
                                        path:[]
                                    }]
                                }
                            }
                        };

                        // If we get an error, we must call external broker
                        RestHandler.forwardCallback(__brokerConfig['broker_ed'], new_log, original_id, function(error, response) {
                            if(error || response.status != 200) {
                                __logger.error("RestHandler.forward: Error doing forward callback to origin");
                                __logger.debug("RestHandler.forward: Trace:");
                                __logger.debug(response.error || error); // TODO: check this, maybe change to just 'error'
                            }
                            RequestHandler.deleteRequest(request_id, function(error) {});
                        });
                    }
                }
            });
        }
    });
}

/**
 * Updates the status of the request and makes the needed calls according to callback parameters
 * Works mostly asynchronously and does not provide any output unless the request_id is not correct,
 * in other case it only updates the database.
 * @param {object} callback_body Object with the callback parameters in which the response for the request is contained.
 * @param {function} callback (error) Callback with the error or null if the original_id is ok.
 */
ForwardingHandler.prototype.forwardCallback = function(callback_body, callback) {

    var original_id = callback_body.request_id;
    
    // FIXME: This encapsulation allow us to pass both strings and JSON objects through swagger-tools midleware.
    // The ideal solution is to allow this at swagger-tools level, but we can't do that right now.
    callback_body.response_data = callback_body.response_data.data;
    // Get request
    RequestHandler.getRequest(callback_body.request_id, function(error, request) {
        if(error) {

            __logger.error("ForwardingHandler.forwardCallback: Got error finding request " + original_id);
            __logger.debug("ForwardingHandler.forwardCallback: Trace ");
            __logger.debug("ForwardingHandler.forwardCallback:" + error);

            callback(error);

        } else if(!request) {

            __logger.warn("ForwardingHandler.forwardCallback: Can not find request " + original_id);
            __logger.debug("ForwardingHandler.forwardCallback: Trace ");
            __logger.debug("ForwardingHandler.forwardCallback:" + error);

            callback({name: "CastError", message: "Can not find request"});

        } else {
            // Got request
            if(request.status != 'FORWARDED') {
                // Non consistent request

                __logger.error("ForwardingHandler.forwardCallback: Found request " + original_id + " that is not in FORWARDED state.");
                __logger.debug("ForwardingHandler.forwardCallback: Trace ");
                __logger.debug("ForwardingHandler.forwardCallback:" + error);

                callback({name: "CastError", message: "Can not find request"});

            } else {

                // Found consistent request
                __logger.debug("ForwardingHandler.forwardCallback: Request is in FORWARDED state, finishing.");

                // Return control and continue on background
                callback(null);

                // Forwarding process finished
                var first_log = request.request_log[0];

                // Don't call unprotect if response status means error (not 2xx)
                if (callback_body.response_status >= 300) { //TODO, check the codes

                    __logger.warn("ForwardingHandler.forwardCallback: Got error " + callback_body.response_status + " from external domain.");

                    RequestHandler.updateRequest(callback_body.request_id, 'FINISHED', {
                        response:{
                            service_name: first_log.request.service_name,
                            service_path: first_log.request.service_path,
                            status: callback_body.response_status,
                            headers: {},
                            body: callback_body.response_data
                        }
                    }, function(error) {});

                } else {

                    __logger.debug("ForwardingHandler.forwardCallback: Got successful response code " + callback_body.response_status + " from external domain.");

                    ServiceInfo.findWithLocation(first_log.request.service_name, function(error, service) {
                        if(error) {

                            // Weird error finding service
                            __logger.error("ForwardingHandler.forwardCallback: Got error finding service that should exist.");
                            __logger.debug("ForwardingHandler.forwardCallback: Trace ");
                            __logger.debug("ForwardingHandler.forwardCallback:" + error);

                            RequestHandler.updateRequest(callback_body.request_id, 'FINISHED', {
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
                            __logger.debug("ForwardingHandler.forwardCallback: Found service where the callback came from.");

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
                                    __logger.error("ForwardingHandler.forwardCallback: Got error un-transforming body.");
                                    __logger.debug("ForwardingHandler.forwardCallback: Trace ");
                                    __logger.debug("ForwardingHandler.forwardCallback:" + error);

                                    RequestHandler.updateRequest(callback_body.request_id, 'FINISHED', {
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
                                    __logger.debug("ForwardingHandler.forwardCallback: Un-transformation process started.");

                                    RequestHandler.updateRequest(callback_body.request_id, 'UNPROTECTING', {
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
                                    __logger.debug("ForwardingHandler.forwardCallback: Un-transformation process finished.");

                                    RequestHandler.updateRequest(callback_body.request_id, 'FINISHED', {
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
            }
        }
    });
}

var forwardingHandler = module.exports = exports = new ForwardingHandler;