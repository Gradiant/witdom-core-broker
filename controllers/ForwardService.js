'use strict';

var brokerConfig = require('../config');
var requestForwardingHandler = require('../request_forwarding/requestForwardingHandler');

exports.forwardDomainPOST = function(args, res, next) {
    /**
     * parameters expected in the args:
     * service (Object) JSON with all the parameters of the request
     **/

    var request_data = {
        request: {
            original_id: args.service.value.request_id,
            service_name: args.service.value.service_name,
            service_path: args.service.value.request_uri,
            method: args.service.value.request_type,
            headers: args.service.value.request_headers,
            body: args.service.value.request_data
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
     * service (Object) JSON with all the parameters of the request
     * response_data (Object) JSON with the parameters of the response
     * response_headers (Object) A set of HTTP headers to pass to the service/module when sending the response
     * response_status (Object) http status code
     * request_id (String) Request identifier
     **/

    var body = args.service.value;
    requestForwardingHandler.doForwardedCallback(args.service.value, function(error) {
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
        } else {
            // no response value expected for this operation
            res.end();
        }
    })
}

