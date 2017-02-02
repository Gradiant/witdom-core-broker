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
RestHandler.prototype.request = function(request_data, request_id, callback) {
    
    // add extra broker callback header
    request_data.request.headers['X-Broker-Callback-URL'] = '/request/callback?request_id=' + request_id;
    // TODO, fake method
    //==========================
    RestMod.rest(url, method, headers, body, retries, function(error, response) {
    //==========================
        if(!response.status) {

            __logger.warn("RestHandler.request: no response from service " + service_id);

            // If communication fails, we update service on database
            ServiceInfo.updateService(request_data.request.service_name, function(error, service) {
                if(error) {
                    if(error.code == 404) {
                        __logger.warn("RestHandler.request: can not find service " + service_id + " info");
                        __logger.silly("RestHandler.request: trace:");
                        __logger.silly(error);

                        var code = 404;
                        var message = "service not found";
                    } else {
                        __logger.warn("RestHandler.request: got error updating service " + service_id + " info");
                        __logger.silly("RestHandler.request: trace:");
                        __logger.silly(error);

                        var code = 500;
                        var message = "internal server error, can not update database";
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
                    
                    __logger.debug("RestHandler.request: updated service " + service_id + " info.");

                    // TODO, fake method
                    //==========================
                    RestMod.rest(url, method, headers, body, retries, function(error, response) {
                    //==========================
                        if(!response.status) {

                            __logger.error("RestHandler.request: got error contacting updated service " + service_id);
                            __logger.debug("RestHandler.request: trace:");
                            __logger.debug(response.error);

                            // If communication fails on updated service, we asume we can not do anything
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

                            __logger.debug("RestHandler.request: success on contating with updated service " + service_id);

                            callback(null, response)

                            // Move to forward.js
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
                                var status = 'IN_PROGRESS';
                                self.updateRequest(request_id, status, new_log, function(error) {});
                            } else {
                                var status = 'FINISHED';
                                Request.findById(request_id, function(error, request) {
                                    if(!error) {
                                        // Successful request forwading
                                        if(request.origin != 'local') {
                                            var first_log = request.request_log[0];
                                            var original_id = first_log.request.original_id;
                                            self.forwardCallback(__brokerConfig.broker_ed, original_id, new_log, function(response) {
                                                if(!response.status || response.status != 200) {
                                                    __logger.warn("RestHandler.request: Error doing forward callback to origin");
                                                    __logger.silly("RestHandler.request: Trace:");
                                                    __logger.silly(response.error);
                                                }
                                                self.deleteRequest(request_id, function(error) {});
                                            });
                                        } else {
                                            self.updateRequest(request_id, status, new_log, function(error) {});
                                        }
                                    }
                                });
                            }
                            //=========================
                        }
                    });
                }
            });
        } else {

            __logger.debug("RestHandler.request: success on contating with service " + service_id);

            callback(null, response)            

            // Move to forward.js
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
                        __logger.warn("ForwardingHandler.doRequest: Error updating request in database");
                        __logger.debug("ForwardingHandler.doRequest: Trace:");
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
                                    __logger.warn("ForwardingHandler.doRequest: Error doing forward callback to origin");
                                    __logger.debug("ForwardingHandler.doRequest: Trace:");
                                    __logger.debug(response.error);
                                }
                                self.deleteRequest(request_id, function(error) {});
                            });
                        } else {
                            self.updateRequest(request_id, status, new_log, function(error) {});
                        }
                    }
                });
            }
            //=========================
        }
    });
}

/**
 * Forwards the request to the given domain.
 */
RestHandler.prototype.forwardRequest = function(domain_data, request_id, request_data, callback) {
    
    
}

/**
 * Returns forwarded request to its origin
 */
RestHandler.prototype.forwardCallback = function(domain_data, request_id, callback_data, callback) {
    

}