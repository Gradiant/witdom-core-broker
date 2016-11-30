'use strict';

var brokerConfig = require('../config');
var mongoose = require('mongoose');
var Service = require('../models/mongo/service');
var unirest = require('unirest');
var requestForwardingHandler = require('../request_forwarding/requestForwardingHandler');
var stream = require('stream');
var protector = require('../protection/po_connector').Protector;

exports.requestCallbackPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service (Result)
   * request_id (String)
   **/

  requestForwardingHandler.getRequest(args.request_id.value, function(error, request) {
      if(error) {
            if(error.name == "CastError") {
                // Error parsing ID
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(404);
                res.end(JSON.stringify({
                    message: [{
                        code:"404",
                        message: error.message,
                        path:['/v1/request/callback']
                    }]
                }));
            } else {
                // Malfunction (database) error
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: [{
                        code:"500",
                        message:"internal server error",
                        path:['/v1/request/callback']
                    }]
                }));
            }
        } else if(!request) {
            // Request does not exist
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(404);
            res.end(JSON.stringify({
                message: [{
                    code:"404",
                    message:"requested resource does not exist",
                    path:['/v1/request/callback']
                }]
            }));
        } else {
            // Got request
            // FIXME, most of this code should go on the requestForwardingHandler module
            if(request.origin != 'local') {
                // Return request to origin domain
                var first_log = request.request_log[0];
                var original_id = first_log.request.original_id;
                var origin = request.origin;    // TODO get origin from configuration
                var callback_data = {   // FIXME, only for remember how to get this data
                    response_data: args.request_data.value,
                    response_headers: args.headers.value,
                    response_status: 200,    // TODO, there is some way to get status from service?
                    request_id: original_id
                }
                // TODO, Implement returnForwardedRequest in requestForwardingHandler

            } else if(request.status == 'PROTECTING') {
                // Protection process finished
                var first_log = request.request_log[0];
                var originalCallParameters = first_log.response.body;
                var receivedCallParameters = args.request_data.value;
                // Change data and forward request
                protector.endProtection(originalCallParameters, receivedCallParameters, function(error, finalCallParameters) {
                    // TODO Implement forwardRequest in requestForwardingHandler
                });
            } else if(request.status == 'UNPROTECTING') {
                // Unprotection status finished
                var last_response_log = request.request_log[request.request_log.length - 2];    // FIXME, this does not look like a proper way to recover last response
                var first_log = request.request_log[0];
                var originalCallParameters = last_response_log.response.body;
                var receivedCallParameters = args.request_data.value;
                // Cange data and end request
                protector.endUnprotection(originalCallParameters, receivedCallParameters, function(error, finalCallParameters) {
                    requestForwardingHandler.updateRequest(request_id, 'FINISHED', {
                        response: {
                            service_name: first_log.request.service_name,
                            service_path: first_log.request.service_path,
                            status: 200,    // TODO, there is some way to get status from service?
                            headers: args.headers.value,
                            body: finalCallParameters,
                        }
                    }, function(error) {
                        if(error) {
                            // Malfunction (database) error
                            res.setHeader('Content-Type', 'application/json');
                            res.writeHead(500);
                            res.end(/* TODO, define errors */);
                        } else {
                            // no response value expected for this operation
                            res.end();
                        }
                    });
                });
            } else if(request.status == 'PROCESSING') {
                // Local request finished
                var first_log = request.request_log[0];
                requestForwardingHandler.updateRequest(request_id, 'FINISHED', {
                    response:{
                        service_name: first_log.request.service_name,
                        service_path: first_log.request.service_path,
                        status: 200,    // TODO, there is some way to get status from service?
                        headers: args.headers.value,
                        body: args.request_data.value,
                    }
                }, function(error) {
                    if(error) {
                        // Malfunction (database) error
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(500);
                        res.end(/* TODO, define errors */);
                    } else {
                        // no response value expected for this operation
                        res.end();
                    }
                });
            } 
        }
    });
}

exports.requestCreateGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * service_id (String)
     * service_uri (String)
     * xAuthToken (String)
     **/

    requestCreate({
        request: {
            service_name: args.service_id.value,
            service_path: args.service_uri.value,
            method: 'GET',
            headers: args.headers.value
        }
    }, res, next);
}

exports.requestCreatePOST = function(args, res, next) {
    /**
     * parameters expected in the args:
     * service_id (String)
     * service_uri (String)
     * request_data (Request)
     * xAuthToken (String)
     **/

    requestCreate({
        request: {
            service_name: args.service_id.value,
            service_path: args.service_uri.value,
            method: 'POST',
            headers: args.headers.value,
            body: args.request_data.value
        }
    }, res, next);
}

var requestCreate = function(request_data, res, next) {
    // New request
    requestForwardingHandler.createRequest(request_data, function(error, request_id) {
        if(error) {
            // Malfunction (database) error
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({
                message: [{
                    code:"500",
                    message:"internal server error",
                    path:['/v1/request/create']
                }]
            }));
        } else {
            // Request created
            res.setHeader('Content-Type', 'application/text');
            res.writeHead(202);
            res.end(request_id);
        }
    });
}

exports.requestCreate_blockerGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service_id (String)
   * service_uri (String)
   * xAuthToken (String) 
   **/

    requestCreate_blocker({
        request: {
            service_name: args.service_id.value,
            service_path: args.service_uri.value,
            method: 'GET',
            headers: args.headers.value
        }
    }, res, next);
}

exports.requestCreate_blockerPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service_id (String)
   * service_uri (String)
   * request_data (Request)
   * xAuthToken (String)
   **/

   requestCreate_blocker({
        request: {
            service_name: args.service_id.value,
            service_path: args.service_uri.value,
            method: 'POST',
            headers: args.headers.value,
            body: args.request_data.value
        }
    }, res, next);
}

var requestCreate_blocker = function(request_data, res, next) {
    requestForwardingHandler.createRequest(request_data, function(error, request_id) {
        if(error) {
            // Malfunction (database) error
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({
                message: [{
                    code:"500",
                    message:"internal server error",
                    path:['/v1/request/create_blocker']
                }]
            }));
        } else {
            // Save res (connected socket) with watcher function (activates once each 0.5 seconds)
            var watcher = setInterval(function(){
                // Function itself
                var self = watcher;
                // Saved response object (socket)
                var response_object = res;
                requestForwardingHandler.getRequest(request_id, function(error, request) {
                    if(error || !request) {
                        // We can not get the request from the database
                        clearInterval(watcher);
                    } else {
                        // Got request
                        if(request.status == 'FINISHED') {
                            // Request is already finished
                            var response_data = request.request_log[request.request_log.length - 1];
                            var response_body = response_data.response.body || {};
                            var response_headers = response_data.response.headers || {};
                            var response_status = response_data.response.status;
                            // Set headers
                            var keys = Object.keys(response_headers);
                            for(var index in keys) {
                                response_object.setHeader(keys[index], response_headers[keys[index]]);
                            }
                            // Set status
                            response_object.writeHead(response_status);
                            // Send body
                            if((response_body instanceof stream.Stream) || (response_body instanceof Buffer) || (typeof(response_body) == 'string')) {
                                // Writable body
                                response_object.end(response_body);
                            } else {
                                // Serializable body
                                response_object.end(JSON.stringify(response_body));
                            }
                            // Stop watcher
                            clearInterval(watcher);
                        }
                    }
                });
            }, 500);
        }
    });
}

exports.requestGetresultGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * request_id (String)
     * xAuthToken (String)
     **/

    requestForwardingHandler.getRequest(args.request_id.value, function(error, request) {
        if(error) {
            if(error.name == "CastError") {
                // Error parsing ID
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(404);
                res.end(JSON.stringify({
                    message: [{
                        code:"404",
                        message: error.message,
                        path:['/v1/request/getresult']
                    }]
                }));
            } else {
                // Malfunction (database) error
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(500);
                res.end(JSON.stringify({
                    message: [{
                        code:"500",
                        message:"internal server error",
                        path:['/v1/request/getresult']
                    }]
                }));
            }
        } else if(!request) {
            // Request does not exist
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(404);
            res.end(JSON.stringify({
                message: [{
                    code:"404",
                    message:"requested resource does not exist",
                    path:['/v1/request/getresult']
                }]
            }));
        } else {
            // Got request
            if(request.status == 'FINISHED') {
                // Request is already finished
                var response_data = request.request_log[request.request_log.length - 1];
                var response_body = response_data.response.body || {};
                var response_headers = response_data.response.headers || {};
                var response_status = response_data.response.status;
                // Set headers
                var keys = Object.keys(response_headers);
                for(var index in keys) {
                    res.setHeader(keys[index], response_headers[keys[index]]);
                }
                // Set status
                res.writeHead(response_status);
                // Send body
                if((response_body instanceof stream.Stream) || (response_body instanceof Buffer) || (typeof(response_body) == 'string')) {
                    // Writable body
                    res.end(response_body);
                } else {
                    // Serializable body
                    res.end(JSON.stringify(response_body));
                }
            } else {
                // Request has not yet ended
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(202);
                res.end(/* TODO, define data */);
                // ASK for status to the PO??
            }
        }
    });
}
