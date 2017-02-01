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

function Rest() {
    // Data
    this.ca;
    this.certificate_key;
    this.certificate;
    this.agent
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