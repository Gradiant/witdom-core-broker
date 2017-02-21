'use strict';

var request = require('request');
//var brokerConfig = require('../config');
var orchestrator = require(__brokerConfig.orchestrator.name).Orchestrator;
var mongoose = require('mongoose');
var Request = require('../models/mongo/request');
var Service = require('../models/mongo/service');
var unirest = require('unirest');
var fs = require('fs');
var stream = require('stream');
var ServiceInfo = require('../service_info/ServiceInfo');
var protector = require('../protection/po_connector').Protector;
var superagent = require('superagent');

/**
 * 
 */
function RequestForwardingHandler()
{
    // Data
    this.ca;
    this.certificate_key;
    this.certificate;
    this.agent;
}

/**
 * Initializes the module
 */
RequestForwardingHandler.prototype.initialize = function(config, callback) {
    // Configuration load
    try {
        this.ca = fs.readFileSync(config.ca);
        this.certificate_key = fs.readFileSync(config.certificate_key);
        this.certificate = fs.readFileSync(config.certificate);

        this.agent = superagent.agent();
        callback(null); // no error
    } catch (error) {
        callback(error);
    }
}

/**
 * Creates the REST call using the parameters given.
 */
RequestForwardingHandler.prototype.doRestCall = function(service_data, request_data, callback) {
    
    // Arrange path
    var request_path = request_data.request.service_path || "";
    if(request_path.charAt(0) != '/') request_path = '/' + request_path;
    // URL generation
    //var request_url = __brokerConfig.protocol + "://" + service_data.host + ":" + service_data.port + request_path;
    var request_url = __brokerConfig.protocol + "://" + service_data.uri + request_path;
    __logger.silly("RequestForwardingHandler.doRestCall, request_url: " + request_url);
    __logger.silly("RequestForwardingHandler.doRestCall, request_headers:");
    __logger.silly(JSON.stringify(request_data.request.headers, null, 2));

    // Request options
    var options = {
        url: request_url,
        method: request_data.request.method,
        headers: request_data.request.headers,
        //cert: this.certificate,
        //key: this.certificate_key,
        //ca: this.ca,
        //strictSSL: true,  // TODO forces agent not to be empty
        //agent: "¿?"
    };
    if (__logger) {
        __logger.info(options.headers);
    }

    // Check if the request can use body
    if(request_data.request.method == 'POST' || request_data.request.method == 'PUT' || request_data.request.method == 'PATCH') {
        // Check body type
        if(!(request_data.request.body instanceof stream.Stream) && 
           !(request_data.request.body instanceof Buffer) && 
           !(typeof(request_data.request.body) == 'string')) {

            // If it is not a string, we check if is JSON
            if(typeof(request_data.request.body) == 'object' && request_data.request.headers['content-type'] == 'application/json') {
                try {
                    // If is we have JSON header, we test we can stringify it, if not, the request creation will fail
                    /**
                     * We net to test this because we can not catch if the request module fails to write the body.
                     * TODO, We should change this
                     */
                    JSON.stringify(request_data.request.body);
                    options.json = true;
                    options.body = request_data.request.body || {};
                } catch (error) {
                    // If the atempt to stringify fails, the request is not supported
                    var response = {};
                    response.status = 400;
                    response.code = 400;
                    response.headers = {};
                    response.body = {
                        message: [{
                            code:"400",
                            message: "MALFORMED BODY",
                            path:[]
                        }]
                    };
                    return callback(response);
                }
            } else {
                // If not, the request is not supported
                var response = {};
                response.status = 400;
                response.code = 400;
                response.headers = {};
                response.body = {
                    message: [{
                        code:"400",
                        message: "UNSUPORTED BODY",
                        path:[]
                    }]
                };
                return callback(response);
            }
        } else {
            // If it is a string, we allow body
            options.json = false;
            options.body = request_data.request.body || "";
        }
    }

    //===============================================//
    //=\/\/\/\/REMOVE THIS, ONLY FOR TESTING\/\/\/\/=//
    //===============================================//
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     // TODO REMOVE!!!
    //===============================================//
    //=/\/\/\/\REMOVE THIS, ONLY FOR TESTING/\/\/\/\=//
    //===============================================//

    // Request creation
    try{
        request(options, function(error, response, body) {
            if(error) {
                __logger.silly("RequestForwardingHandler.doRestCall, request error: ");
                __logger.silly(error);
                // If we can not reach server, we do not set up response status
                var response = {};
                response.error = error;
                callback(response);
            } else if(response) {
                if((response.body instanceof stream.Stream) || (response.body instanceof Buffer) || (typeof(response.body) == 'string')) {
                    // Writable body
                    if (__logger) {
                        __logger.info("Writable body");
                        __logger.info(response.body);
                    }
                    if ((response.headers["content-type"] || response.headers["Content-Type"]) == 'application/json') {
                        try {
                            response.body = JSON.parse(response.body);
                        } catch(error) {
                            response.body = {
                                message: [{
                                    code:"undefined",
                                    message: "MALFORMED RESPONSE FROM SERVICE " + service_data.service_id,
                                    path:[]
                                }]
                            };
                        }
                    }
                } else {
                    // Serializable body
                    if (__logger) {
                        __logger.info("Serializable body");
                        __logger.info(response.body);
                        __logger.info(JSON.stringify(response.body));
                    }
                }
                __logger.silly("RequestForwardingHandler.doRestCall, request response: ");
                __logger.silly(response.statusCode);
                __logger.silly(response.text);
                __logger.silly(response.body);
                // If success, add status/code and body if exists
                response.status = response.statusCode;
                response.code = response.statusCode;
                response.body = response.body || {};
                callback(response);
            } // Should exist either an error or a response, do not bother with more options
        });
    } catch (error) {
        var response = {};
        response.status = 400;
        response.code = 400;
        response.headers = {};
        response.body = {
            message: [{
                code:"400",
                message: "MALFORMED BODY",
                path:[]
            }]
        };
        callback(response);
    }
}

/**
 * Creates the REST call using the parameters given.
 */
RequestForwardingHandler.prototype.doRestCall2 = function(service_data, request_data, callback) {
    // Arrange path
    var request_path = request_data.request.service_path || "";
    if(request_path.charAt(0) != '/') request_path = '/' + request_path;
    // URL generation
    var request_url = __brokerConfig.protocol + "://" + service_data.uri + request_path;
    //console.log("request_url: " + request_url);

    if (request_data.request.method == 'GET') {
        this.agent.get(request_url)
        .set(request_data.request.headers)
        .end(callback);
    } else if (request_data.request.method == 'POST') {
        this.agent.post(request_url)
        .set(request_data.request.headers)
        .send(request_data.request.body).end(callback);
    } else {
        callback({error: "Wrong method: " + request_data.request.method});
    }
    /*this.agent(request_data.request.method, request_url)
    .set(request_data.request.headers)
    .send(body).end(callback);*/
}

/**
 * Forwards the request to the given domain.
 */
RequestForwardingHandler.prototype.doForwardRequest = function(domain_data, request_id, request_data, callback) {
    
    // URL generation
    var request_url = __brokerConfig.protocol + "://" + domain_data.domain_name + ":" + domain_data[__brokerConfig.protocol].port + '/v1/forward/domain';
    __logger.silly("RequestForwardingHandler.doForwardRequest, request_url: " + request_url);

    // Forward body
    var body = {
        request_data: request_data.request.body,
        request_headers: request_data.request.headers,
        request_type: request_data.request.method,
        request_uri: request_data.request.service_path,
        service_name: request_data.request.service_name,
        request_id: request_id
    }

    __logger.silly("RequestForwardingHandler.doForwardRequest, request body:");
    __logger.silly(JSON.stringify(body, null, 2));

    // Request options
    var options = {
        url: request_url,
        method: 'POST',
        //headers: request_data.request.headers,
        json: true,
        body: body,
        //cert: this.certificate,
        //key: this.certificate_key,
        //ca: this.ca,
        //strictSSL: true,  // TODO forces agent not to be empty
        //agent: "¿?"
    };

    try {
        // If is we have JSON header, we test we can stringify it, if not, the request creation will fail
        /**
         * We net to test this because we can not catch if the request module fails to write the body.
         * TODO, We should change this
         */
        JSON.stringify(options.body);
    } catch (error) {
        // If the atempt to stringify fails, the request is not supported
        var response = {};
        response.status = 400;
        response.code = 400;
        response.headers = {};
        response.body = {
            message: [{
                code:"400",
                message: "MALFORMED BODY",
                path:[]
            }]
        };
        return callback(response);
    }

    //===============================================//
    //=\/\/\/\/REMOVE THIS, ONLY FOR TESTING\/\/\/\/=//
    //===============================================//
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     // TODO REMOVE!!!
    //===============================================//
    //=/\/\/\/\REMOVE THIS, ONLY FOR TESTING/\/\/\/\=//
    //===============================================//

    // Request creation
    try{
        request(options, function(error, response, body) {
            if(error) {
                __logger.silly("RequestForwardingHandler.doForwardRequest, request error: ");
                __logger.silly(error);
                // If we can not reach server, we do not set up response status
                var response = {};
                response.error = error;
                callback(response);
            } else if(response) {
                __logger.silly("RequestForwardingHandler.doForwardRequest, request response: ");
                __logger.silly(response.statusCode);
                __logger.silly(response.text);
                __logger.silly(response.body);
                // If success, add status/code and body if exists
                response.status = response.statusCode;
                response.code = response.statusCode;
                response.body = response.body || {};
                callback(response);
            } // Should exist either an error or a response, do not bother with more options
        });
    } catch (error) {
        var response = {};
        response.status = 400;
        response.code = 400;
        response.headers = {};
        response.body = {
            message: [{
                code:"400",
                message: "MALFORMED BODY",
                path:[]
            }]
        };
        callback(response);
    }
}

/**
 * Returns forwarded request to its origin
 */
RequestForwardingHandler.prototype.doForwardCallback = function(domain_data, request_id, callback_data, callback) {
    // URL generation
    var request_url = __brokerConfig.protocol + "://" + domain_data.domain_name + ":" + domain_data[__brokerConfig.protocol].port + '/v1/forward/callback';

    // Forward Callback body
    var data = callback_data.response || callback_data.request;
    var body = {
        response_data: {
            data: data.body   // FIXME, this does not looks like a way to solve the problem. i.e. nhapa
        },
        response_headers: data.headers,
        response_status: data.status,
        request_id: request_id
    }

    // Request options
    var options = {
        url: request_url,
        method: 'POST',
        headers: {"content-type": "application/json"},
        json: true,
        body: body,
        //cert: this.certificate,
        //key: this.certificate_key,
        //ca: this.ca,
        //strictSSL: true,  // TODO forces agent not to be empty
        //agent: "¿?"
    };

    try {
        // If is we have JSON header, we test we can stringify it, if not, the request creation will fail
        /**
         * We net to test this because we can not catch if the request module fails to write the body.
         * TODO, We should change this
         */
        __logger.silly("RequestForwardingHandler.doForwardCallback: request body: ");
        __logger.silly(JSON.stringify(options.body, null, 2));
    } catch (error) {
        __logger.silly("RequestForwardingHandler.doForwardCallback: stringify error: ");
        __logger.silly(error);
        // If the atempt to stringify fails, the request is not supported
        var response = {};
        response.status = 400;
        response.code = 400;
        response.headers = {};
        response.body = {
            message: [{
                code:"400",
                message: "MALFORMED BODY",
                path:[]
            }]
        };
        return callback(response);
    }

    //===============================================//
    //=\/\/\/\/REMOVE THIS, ONLY FOR TESTING\/\/\/\/=//
    //===============================================//
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     // TODO REMOVE!!!
    //===============================================//
    //=/\/\/\/\REMOVE THIS, ONLY FOR TESTING/\/\/\/\=//
    //===============================================//

    // Request creation
    try{
        request(options, function(error, response, body) {
            if(error) {
                __logger.silly("RequestForwardingHandler.doForwardCallback, request error: ");
                __logger.silly(error);
                // If we can not reach server, we do not set up response status
                var response = {};
                response.error = error;
                callback(response);
            } else if(response) {
                __logger.silly("RequestForwardingHandler.doRestCall, request response: ");
                __logger.silly(response.statusCode);
                __logger.silly(response.text);
                __logger.silly(response.body);
                // If success, add status/code and body if exists
                response.status = response.statusCode;
                response.code = response.statusCode;
                response.body = response.body || {};
                callback(response);
            } // Should exist either an error or a response, do not bother with more options
        });
    } catch (error) {
        var response = {};
        response.status = 400;
        response.code = 400;
        response.headers = {};
        response.body = {
            message: [{
                code:"400",
                message: "MALFORMED BODY",
                path:[]
            }]
        };
        callback(response);
    }

}

/**
 * Manages the request flow, taking care of the service location and the database updates for
 * the requests and services, if needed.
 * Works asynchronously and does not provide any output, it only updates the database.
 */
RequestForwardingHandler.prototype.doRequest = function(request_id, request_data) {

    // Retrieve service from database
    var service_id = request_data.request.service_name;
    var self = this;
    ServiceInfo.findWithLocation(service_id, function(error, service) {
        if(error) {
            if(error.code == 404) {
                // If we get a system error we update request and exit
                __logger.warn("RequestForwardingHandler.doRequest: Can not find service " + service_id);
                __logger.debug("RequestForwardingHandler.doRequest: trace:");
                __logger.debug(error);
                self.updateRequest(request_id, 'FINISHED', {
                    response:{
                        service_name: request_data.request.service_name,
                        service_path: request_data.request.service_path,
                        status: 404,
                        headers: {},
                        body: {
                            message: [{
                                code:"404",
                                message: "service not found",
                                path:[]
                            }]
                        }
                    }
                }, function(error) {});
            } else {
                // If we get a system error we update request and exit
                __logger.warn("RequestForwardingHandler.doRequest: got error finding service " + service_id);
                __logger.debug("RequestForwardingHandler.doRequest: trace:");
                __logger.debug(error);
                self.updateRequest(request_id, 'FINISHED', {
                    response:{
                        service_name: request_data.request.service_name,
                        service_path: request_data.request.service_path,
                        status: 500,
                        headers: {},
                        body: {
                            message: [{
                                code:"500",
                                message: "internal server error, can not access database",
                                path:[]
                            }]
                        }
                    }
                }, function(error) {});
            }
        } else if(service) {
            if(service.location == 'local') {
                __logger.silly("RequestForwardingHandler.doRequest: Found service " + service_id + " in local domain.");
                request_data.request.headers['X-Broker-Callback-URL'] = '/request/callback?request_id=' + request_id;
                self.doRestCall(service.details, request_data, function(response) {//TODO: we need to pass request_id to doRestCall, because it is needed to build the callback URL
                    if(!response.status) {
                        // If communication fails, we update service on database
                        ServiceInfo.updateService(service_id, function(error, service) {
                            if(error) {
                                if(error.code == 404) {
                                    __logger.warn("RequestForwardingHandler.doRequest: Can not find new service " + service_id + " info");
                                    __logger.debug("RequestForwardingHandler.doRequest: trace:");
                                    __logger.debug(error);
                                    // If we get a system error we update request and exit
                                    self.updateRequest(request_id, 'FINISHED', {
                                        response:{
                                            service_name: request_data.request.service_name,
                                            service_path: request_data.request.service_path,
                                            status: 404,
                                            headers: {},
                                            body: {
                                                message: [{
                                                    code:"404",
                                                    message: "service not found",
                                                    path:[]
                                                }]
                                            }
                                        }
                                    }, function(error) {});
                                } else {
                                    __logger.warn("RequestForwardingHandler.doRequest: got error updating service " + service_id + " info");
                                    __logger.debug("RequestForwardingHandler.doRequest: trace:");
                                    __logger.debug(error);
                                    // If we get a system error we update request and exit
                                    self.updateRequest(request_id, 'FINISHED', {
                                        response:{
                                            service_name: request_data.request.service_name,
                                            service_path: request_data.request.service_path,
                                            status: 500,
                                            headers: {},
                                            body: {
                                                message: [{
                                                    code:"500",
                                                    message: "internal server error, can not update database",
                                                    path:[]
                                                }]
                                            }
                                        }
                                    }, function(error) {});
                                }
                            } else if(service) {
                                __logger.silly("RequestForwardingHandler.doRequest: Found new service " + service_id + " info.");
                                self.doRestCall(service.details, request_data, function(response) {
                                    if(!response.status) {
                                        __logger.warn("RequestForwardingHandler.doRequest: Got error contacting service " + service_id);
                                        __logger.debug("RequestForwardingHandler.doRequest: trace:");
                                        __logger.debug(response.error);
                                        // TODO, If communication fails try to deploy it with cloudify. For now, we asume we can not do anything
                                        self.updateRequest(request_id, 'FINISHED', {
                                            response:{
                                                service_name: request_data.request.service_name,
                                                service_path: request_data.request.service_path,
                                                status: 503,
                                                headers: {},
                                                body: {
                                                    message: [{
                                                        code:"503",
                                                        message: "can not reach service",
                                                        path:[]
                                                    }]
                                                }
                                            }
                                        }, function(error) {});
                                    } else {
                                        __logger.silly("RequestForwardingHandler.doRequest: Success on contating with service " + service_id);
                                        var status;
                                        if(response.status == 202) {
                                            status = 'IN_PROGRESS';
                                        } else {
                                            status = 'FINISHED';
                                        }
                                        self.updateRequest(request_id, status, {
                                            response: {
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
                    } else {
                        var status;
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
                            status = 'IN_PROGRESS';
                            self.updateRequest(request_id, status, new_log, function(error) {
                                if(error) {
                                    __logger.warn("RequestForwardingHandler.doRequest: Error updating request in database");
                                    __logger.debug("RequestForwardingHandler.doRequest: Trace:");
                                    __logger.debug(error);
                                }
                            });
                        } else {
                            status = 'FINISHED';
                            Request.findById(request_id, function(error, request) {
                                if(!error) {
                                    // Successful request forwading
                                    if(request.origin != 'local') {
                                        var first_log = request.request_log[0];
                                        var original_id = first_log.request.original_id;
                                        self.doForwardCallback(__brokerConfig.broker_ed, original_id, new_log, function(response) {
                                            if(!response.status || response.status != 200) {
                                                __logger.warn("RequestForwardingHandler.doRequest: Error doing forward callback to origin");
                                                __logger.debug("RequestForwardingHandler.doRequest: Trace:");
                                                __logger.debug(response.status);
                                                __logger.debug(response.text);
                                                __logger.debug(response.body);
                                                __logger.debug(response.error);
                                            }
                                            self.deleteRequest(request_id, function(error) {
                                                if(error) {
                                                    __logger.warn("RequestForwardingHandler.doRequest: Error deleting request in database");
                                                    __logger.debug("RequestForwardingHandler.doRequest: Trace:");
                                                    __logger.debug(error);
                                                }
                                            });
                                        });
                                    } else {
                                        self.updateRequest(request_id, status, new_log, function(error) {
                                            if(error) {
                                                __logger.warn("RequestForwardingHandler.doRequest: Error updating request in database");
                                                __logger.debug("RequestForwardingHandler.doRequest: Trace:");
                                                __logger.debug(error);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                // TODO, broker callback url
                __logger.silly("RequestForwardingHandler.doRequest: Found service on untrusted domain.")
                protector.protect("/request/callback?request_id=" + request_id, service, request_data.request.headers, request_data.request.body,
                function(error, protectionResponse, finalCallParameters) {
                    if(error) {
                        __logger.warn("RequestForwardingHandler.doRequest: Got error protecting request " + request_id);
                        __logger.debug("RequestForwardingHandler.doRequest: trace:");
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
                        __logger.silly("RequestForwardingHandler.doRequest: Protection process started.");
                        // Protection in progress
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
                        // Protection ended
                        request_data.request.body = finalCallParameters;
                        // TODO, domain data
                        self.doForwardRequest(__brokerConfig.broker_ed, request_id, request_data, function(response) {
                            if(!response.status) {
                                __logger.warn("RequestForwardingHandler.doRequest: Got error forwarding request " + request_id);
                                __logger.debug("RequestForwardingHandler.doRequest: Trace:");
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
                                __logger.silly("RequestForwardingHandler.doRequest: forwading process started.");
                                var status;
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
                                    status = 'FORWARDED';
                                    self.updateRequest(request_id, status, new_log, function(error) {
                                        if(error) {
                                            __logger.warn("RequestForwardingHandler.doRequest: Error updating request in database");
                                            __logger.debug("RequestForwardingHandler.doRequest: Trace:");
                                            __logger.debug(error);
                                        }
                                    });
                                } else {
                                    status = 'FINISHED';
                                    self.updateRequest(request_id, status, new_log, function(error) {
                                        if(error) {
                                            __logger.warn("RequestForwardingHandler.doRequest: Error updating request in database");
                                            __logger.debug("RequestForwardingHandler.doRequest: Trace:");
                                            __logger.debug(error);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    });
}

/**
 * Updates the status of the request and makes the needed calls accortind to callback parameters 
 */
RequestForwardingHandler.prototype.doCallback = function(request_id, callback_headers, callback_body, callback) {
    
    var self = this;
    // Get request from database
    self.getRequest(request_id, function(error, request) {
        if(error) {
            callback(error);
        } else if(!request) {
            // FIXME, not proper way to pass errors
            callback({name: "CastError", message: "request not found"})
        } else {
            // Got request, return OK
            callback(null);
            if (__logger) {
                __logger.info("Received callback for request " + request_id);
                __logger.info("request.origin: " + request.origin);
                __logger.info("request.status: " + request.status);
            }
            // 
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
                        __logger.silly("RequestForwardingHandler.doCallback: first_log:");
                        __logger.silly(JSON.stringify(first_log,null,2));
                        //var request_data = first_log.request;
                        var request_data = first_log;
                        //request_data.body = finalCallParameters;
                        request_data.request.body = finalCallParameters;
                        // TODO, domain data
                        __logger.silly("RequestForwardingHandler.doCallback: request_data:");
                        __logger.silly(JSON.stringify(request_data,null,2));
                        self.doForwardRequest(__brokerConfig.broker_ed, request_id, request_data, function(response) {
                            if(!response.status) {
                                __logger.warn("RequestForwardingHandler.doCallback: Got error forwarding request " + request_id);
                                __logger.debug("RequestForwardingHandler.doCallback: Trace:");
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
                                __logger.silly("RequestForwardingHandler.doCallback: forwading process started.");
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
 * Updates the status of the request and makes the needed calls accortind to callback parameters 
 */
RequestForwardingHandler.prototype.doForwardedCallback = function(callback_body, callback) {
    
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
                            __logger.silly("RequestForwardingHandler.doForwardedCallback: Received body:");
                            __logger.silly(JSON.stringify(callback_body, null, 2));
                            self.getRequest(callback_body.request_id, function(error, request) {
                                if(error) {
                                    callback(error);
                                } else {
                                    var first_log = request.request_log[0];
                                    var token = first_log.request.headers['X-Auth-Token'] || first_log.request.headers['x-auth-token'];
                                    if (token) {
                                        callback_body.response_headers['X-Auth-Token'] = token;
                                        __logger.silly("RequestForwardingHandler.doForwardedCallback: token retrieved from first log and saved in response headers:");
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

/**
 * Saves the new request to the database and starts the request flow.
 */
RequestForwardingHandler.prototype.createRequest = function(request_data, callback) {
    // Save request in the database
    __logger.silly("RequestForwardingHandler.createRequest: request_data");
    __logger.silly(request_data);
    var new_request = new Request({origin: 'local', status: 'IN_PROGRESS', request_log: [request_data]});
    new_request.save(function(error, request) {
        // Return ID to caller
        callback(error, request.id);
        if(!error) {
            // If no error do request
            this.doRequest(request.id, request_data);
        }
    }.bind(this));
}

/**
 * Saves the new request to the database and starts the request flow.
 */
RequestForwardingHandler.prototype.createForwardedRequest = function(origin, request_data, callback) {
    // Save request in the database
    __logger.silly("RequestForwardingHandler.createForwardedRequest: request_data");
    __logger.silly(request_data);
    var new_request = new Request({origin: origin, status: 'IN_PROGRESS', request_log: [request_data]});
    new_request.save(function(error, request) {
        // Return ID to caller
        callback(error, request.id);
        if(!error) {
            // If no error do request
            this.doRequest(request.id, request_data);
        }
    }.bind(this));
}

/**
 * Saves the new request to the database and starts the request flow.
 * This function manages the in-memory storage of the request_object in order to allow sending the
 * response to the client.
 * @deprecated May be removed
 */
RequestForwardingHandler.prototype.createBlockerRequest = function(request_data, request_object, callback) {
    // Save request in the database
    var new_request = new Request({origin: 'local', status: 'IN_PROGRESS', request_log: [request_data]});
    new_request.save(function(error, request) {
        // Return ID to caller
        callback(error, request.id);
        if(!error) {
            // If no error do request
            // TODO, save request_object to memory
            this.doRequest(request.id, request_data);
        }
    }.bind(this));
}

/**
 * Updates the request status and adds new_data to the end of the request_log array.
 */
RequestForwardingHandler.prototype.updateRequest = function(request_id, status, new_data, callback) {
    // Get request identified by given request_id
    Request.findById(request_id, function(error, request) {
        if(error) {
            callback(error);
        } else {
            // Push new_data lo request log
            var new_log = request.request_log;
            new_log.push(new_data);
            // Update request
            request.update(status, new_log, callback);
        }
    });
}

/**
 * Retrieves the request from the database. If there is an in-memory response_object associated,
 * it also retrieves this object.
 */
RequestForwardingHandler.prototype.getRequest = function(request_id, callback) {
    // Get request identified by given request_id
    Request.findById(request_id, callback);
}

/**
 * Removes the request from the database, it also removes the associated response_object from memory if exists.
 */
RequestForwardingHandler.prototype.deleteRequest = function(request_id, callback) {
    // Delete request identified by given id
    Request.remove({_id: request_id}, callback);
}

var connector = module.exports = exports = new RequestForwardingHandler;