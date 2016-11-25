'use strict';

var brokerConfig = require('../config');
var mongoose = require('mongoose');
var Service = require('../models/mongo/service');
var unirest = require('unirest');
var requestForwardingHandler = require('../request_forwarding/requestForwardingHandler');
var stream = require('stream');

exports.requestCallbackPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service (Result)
   * request_id (String)
   **/
  // no response value expected for this operation
  res.end();
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
            headers: args.headers.value,
            body: args.request_data.value
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

requestCreate = function(request_data, res, next) {
    requestForwardingHandler.createRequest(request_data, function(error, request_id) {
        if(error) {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(/* TODO, define errors */);
        } else {
            res.setHeader('Content-Type', 'application/json');
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
            headers: args.headers.value,
            body: args.request_data.value
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

requestCreate_blocker = function(request_data, res, next) {
    requestForwardingHandler.createRequest(request_data, function(error, request_id) {
        if(error) {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(/* TODO, define errors */);
        } else {
            var watcher = setInterval(function(){
                var self = watcher;
                var response_object = res;
                requestForwardingHandler.getRequest(request_id, function(error, request) {
                    if(error || !request) {
                        clearInterval(watcher);
                    } else {
                        if(request.status == 'FINISHED') {
                            var response_data = request.request_log[request.request_log - 1]
                            var response_body = response_data.body;
                            var response_headers = response_data.headers;
                            var response_status = response_data.status;
                            var keys = Object.keys(response_headers);
                            for(index in keys) {
                                response_object.setHeader(keys[index], response_headers[keys[index]]);
                            }
                            response_object.writeHead(response_status);
                            if(!(response_body instanceof stream.Stream) && !(response_body instanceof Buffer) && !(typeof(response_body) == 'string')) {
                                response_object.end(response_body);
                            } else {
                                response_object.end(JSON.stringify(response_body));
                            }
                            clearInterval(watcher);
                        }
                    }
                });
            });
        }
    });
}

exports.requestGetresultGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * request_id (String)
   * xAuthToken (String)
   **/
    var examples = {};
  examples['application/json'] = { };
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}
