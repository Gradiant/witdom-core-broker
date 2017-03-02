'use strict';

var brokerConfig = require('../config');
var mongoose = require('mongoose');
var Service = require('../models/mongo/service');
//var requestForwardingHandler = require('../request_forwarding/requestForwardingHandler');
var RequestHandler = require(__base + 'request_forwarding/requests');
var forwardingHandler = require(__base + 'request_forwarding/forward');
var stream = require('stream');
var protector = require('../protection/po_connector').Protector;
var PoError = require(__base + 'protection/po_connector/lib/poError');
var requestWatcher = require(__base + 'request/requestWatcher');

exports.requestCallbackPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * result (Result)
   * request_id (String)
   **/

  var request_id = args.request_id.value;
  forwardingHandler.requestCallback(args.request_id.value, args.headers.value, args.result.value, function(error) {
  //requestForwardingHandler.doCallback(args.request_id.value, args.headers.value, args.result.value, function(error) {
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
        } else {
            // no response value expected for this operation
            res.end();
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
    forwardingHandler.request(request_data, function(error, request_id) {
    //requestForwardingHandler.createRequest(request_data, function(error, request_id) {
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

    __logger.silly(JSON.stringify(request_data, null, 2));
    forwardingHandler.request(request_data, function(error, request_id) {
    //requestForwardingHandler.createRequest(request_data, function(error, request_id) {
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
            // Save the request in the request watcher
            __logger.silly("requestCreate_blocker: adding request " + request_id);
            requestWatcher.addRequest(request_id, res);

/*            // Save res (connected socket) with watcher function (activates once each 0.5 seconds)
            var watcher = setInterval(function(){
                if (__logger) {
                    __logger.info("Checking status of request " + request_id);
                }
                // Function itself
                var self = watcher;
                // Saved response object (socket)
                var response_object = res;
                requestForwardingHandler.getRequest(request_id, function(error, request) {
                    if(error || !request) {
                        if (__logger) {
                            __logger.info("Error getting the status");
                        }
                        // We can not get the request from the database
                        clearInterval(watcher);
                    } else {
                        // Got request
                        if(request.status == 'FINISHED') {
                            if (__logger) {
                                __logger.info("The status is FINISHED");
                            }
                            // Request is already finished
                            var response_data = request.request_log[request.request_log.length - 1];
                            var response_body = response_data.response.body || {};
                            var response_headers = response_data.response.headers || {};
                            var response_status = response_data.response.status;
                            // Set headers
                            var keys = Object.keys(response_headers);
                            for(var index in keys) {
                                if (keys[index].toLowerCase() === "content-length") {//Skip content-length header because it may be different from the original if the json serialization uses different tabulation
                                    continue;
                                }
                                if (__logger) {
                                    __logger.info("Setting header: " + keys[index]);
                                }
                                response_object.setHeader(keys[index], response_headers[keys[index]]);
                            }
                            // Set status
                            response_object.writeHead(response_status);
                            // Send body
                            if((response_body instanceof stream.Stream) || (response_body instanceof Buffer) || (typeof(response_body) == 'string')) {
                                // Writable body
                                if (__logger) {
                                    __logger.info("Writable body");
                                    __logger.info(response_body);
                                }
                                response_object.end(response_body);
                            } else {
                                // Serializable body
                                if (__logger) {
                                    __logger.info("Serializable body");
                                    __logger.info(response_body);
                                    __logger.info(JSON.stringify(response_body));
                                }
                                response_object.end(JSON.stringify(response_body));
                            }
                            // Stop watcher
                            clearInterval(watcher);
                            requestForwardingHandler.deleteRequest(request_id, function(error){});
                        } else {
                            if (__logger) {
                                __logger.info("The status is " + request.status);
                            }
                        }
                    }
                });
            }, 500);*/
        }
    });
}

exports.requestGetresultGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * request_id (String)
     * xAuthToken (String)
     **/
    __logger.silly("RequestService.requestGetresultGET: request_id: " + args.request_id.value);
    //requestForwardingHandler.getRequest(args.request_id.value, function(error, request) {
    RequestHandler.getRequest(args.request_id.value, function(error, request) {
        if(error) {
            if(error.name == "CastError") {
                __logger.silly("RequestService.requestGetresultGET: CastError:");
                __logger.silly(error.message);
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
                __logger.silly("RequestService.requestGetresultGET: database error");
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
            __logger.silly("RequestService.requestGetresultGET: request does not exist");
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
                __logger.silly("RequestService.requestGetresultGET: request has finished");
                // Request is already finished
                var response_data = request.request_log[request.request_log.length - 1];
                var response_body = response_data.response.body || {};
                var response_headers = response_data.response.headers || {};
                var response_status = response_data.response.status;
                // Set headers
                var keys = Object.keys(response_headers);
                for(var index in keys) {
                    if (keys[index].toLowerCase() === "content-length") {//Skip content-length header because it may be different from the original if the json serialization uses different tabulation
                        continue;
                    }
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
                //requestForwardingHandler.deleteRequest(args.request_id.value, function(error){});
                RequestHandler.deleteRequest(args.request_id.value, function(error){});
            } else if (request.status == 'PROTECTING' || request.status == 'UNPROTECTING') {
                __logger.silly("RequestService.requestGetresultGET: request is in PROTECTING or UNPROTECTING state");
                // The request is in PROTECTING or UNPROTECTING state
                var response_data = request.request_log[request.request_log.length - 1];
                __logger.silly(request.request_log);
                console.log(response_data.response.body);
                var response_body = response_data.response.body || {}; // this is the 'processInstanceId'
                protector.getProcessStatus(response_body, args.headers.value, function(error, statusResponse) {
                    if (error) {
                        if (error instanceof PoError) {
                            res.writeHead(503); // ??Other error
                            res.end({message: [{"code": error.code, "message": error.reason, "path": ""}]});
                        } else if (error.status == 404) {
                            res.setHeader('Content')
                            res.writeHead(404);
                            res.end({message: [{"code": 404, "message": "Request not found in PO", "path": ""}]});
                        }
                        // Maybe mark the request as finished
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(202);
                        res.end(JSON.stringify(statusResponse));
                    }
                });

            
            } else {
                __logger.silly("RequestService.requestGetresultGET: request has not finished");
                // Request has not yet ended
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(202);
                res.end(/* TODO, define data */);
                // ASK for status to the PO??
            }
        }
    });
}
