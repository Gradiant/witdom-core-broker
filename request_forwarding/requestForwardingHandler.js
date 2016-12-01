'use strict';

var request = require('request');
var brokerConfig = require('../config');
var orchestrator = require(brokerConfig.orchestrator.name).Orchestrator;
var mongoose = require('mongoose');
var Request = require('../models/mongo/request');
var Service = require('../models/mongo/service');
var unirest = require('unirest');
var fs = require('fs');
var stream = require('stream');
var ServiceInfo = require('../service_info/ServiceInfo');
var protector = require('../protection/po_connector').Protector;

/**
 * 
 */
function RequestForwardingHandler()
{
    // Data
    this.ca;
    this.certificate_key;
    this.certificate;
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
    var request_url = "https://" + service_data.host + ":" + service_data.port + request_path;

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
                // If we can not reach server, we do not set up response status
                var response = {};
                response.error = error;
                callback(response);
            } else if(response) {
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
 * Forwards the request to the given domain.
 */
RequestForwardingHandler.prototype.doForwardRequest = function(domain_data, request_id, request_data, callback) {
    
    // URL generation
    var request_url = "https://" + domain_data.http.host + ":" + domain_data.http.port + '/v1/forward/domain';

    // Forward body
    var body = {
        request_data: request_data.request.body,
        request_headers: request_data.request.headers,
        request_type: request_data.request.method,
        request_uri: request_data.request.service_path,
        service_name: request_data.request.service_name,
        request_id: request_id
    }

    // Request options
    var options = {
        url: request_url,
        method: request_data.request.method,
        headers: request_data.request.headers,
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
        JSON.stringify(request_data.request.body);
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
                // If we can not reach server, we do not set up response status
                var response = {};
                response.error = error;
                callback(response);
            } else if(response) {
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
                self.updateRequest(request_id, 'FINISHED', {
                    response:{
                        service_name: request_data.request.service_name,
                        service_path: request_data.request.service_path,
                        status: 500,
                        headers: {},
                        body: {
                            message: [{
                                code:"500",
                                message: "internal server error",
                                path:[]
                            }]
                        }
                    }
                }, function(error) {});
            }
        } else if(service) {
            if(service.location == 'local') {
                self.doRestCall(service.service_data, request_data, function(response) {
                    if(!response.status) {
                        // If communication fails, we update service on database
                        ServiceInfo.updateService(service_id, function(error, service) {
                            if(error) {
                                if(error.code == 404) {
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
                                                    message: "internal server error",
                                                    path:[]
                                                }]
                                            }
                                        }
                                    }, function(error) {});
                                }
                            } else if(service) {
                                self.doRestCall(service.service_data, request_data, function(response) {
                                    if(!response.status) {
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
            } else {
                // FIXME, chage parameters
                protector.protect("broker/callback/url", request_data.request.headers, request_data.request.body,
                function(error, protectionResponse, finalCallParameters) {
                    if(error) {
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
                                        message: "can not reach orchestration service",
                                        path:[]
                                    }]
                                }
                            }
                        }, function(error) {});
                    } else if(protectionResponse) {
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
                        // Protection ended
                        protector.endProtection(request_data.request.body, protectionResponse, function(error, finalCallParameters) {
                            request_data.request.body = finalCallParameters;
                            self.doForwardRequest("domain_data", request_id, request_data, function(response) {
                                if(!response.status) {
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
                                                    message: "can not reach orchestration service",
                                                    path:[]
                                                }]
                                            }
                                        }
                                    }, function(error) {});
                                } else {
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
                        });
                    }
                });
            }
        }
    });
}

/**
 * Saves the new request to the database and starts the request flow.
 */
RequestForwardingHandler.prototype.createRequest = function(request_data, callback) {
    // Save request in the database
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
 * @deprecated
 */
RequestForwardingHandler.prototype.createForwardedRequest = function(origin, request_data, callback) {
    // Save request in the database
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