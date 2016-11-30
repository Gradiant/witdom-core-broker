'use strict';

var requestForwardingHandler = require('../request_forwarding/requestForwardingHandler');

exports.forwardDomainPOST = function(args, res, next) {
    /**
     * parameters expected in the args:
     * request_data (Object) JSON with the parameters of the request in case request_type is POST
     * request_headers (Object) A set of HTTP headers to pass to the service/module when doing the request
     * request_type (String) GET or POST
     * request_uri (String) http/https call after IP and port of the service
     * service_name (String) Name representing a specific service in WITDOM.
     * request_id (String) Request identifier
     **/

    var request_data = {
        request: {
            original_id: args.request_id.value,
            service_name: args.service_name.value,
            service_path: args.request_uri.value,
            method: args.request_type.value,
            headers: args.request_headers.value,
            body: args.request_data.value
        }
    };

    // TODO, find a way to get origin domain
    var origin = "untrusted"

    requestForwardingHandler.createForwardedRequest(origin, request_data, function(error, request_id) {
        if(error) {
            // Malfunction (database) error
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({
                message: [{
                    code:"500",
                    message:"internal server error",
                    path:['/v1/forward/domain']
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

exports.forwardCallbackPOST = function(args, res, next) {
    /**
     * parameters expected in the args:
     * response_data (Object) JSON with the parameters of the response
     * response_headers (Object) A set of HTTP headers to pass to the service/module when sending the response
     * response_status (Object) http status code
     * request_id (String) Request identifier
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
                        path:['/v1/forward/callback']
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
            if(request.status != 'FORWARDED') {
                // Non consistent ID
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(404);
                res.end(JSON.stringify({
                    message: [{
                        code:"404",
                        message: error.message,
                        path:['/v1/forward/callback']
                    }]
                }));
            } else {
                // Found consistent request
                var last_log = request.request_log[request.request_log.length - 1];
                // TODO, call PO for unprotection
                requestForwardingHandler.updateRequest(request_id, 'FINISHED', {
                    response:{
                        service_name: last_log.request.service_name,
                        service_path: last_log.request.service_path,
                        status: args.response_status.value,
                        headers: args.response_headers.value,
                        body: args.response_data.value,
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

