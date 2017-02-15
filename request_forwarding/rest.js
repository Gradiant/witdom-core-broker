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

                        callback({code: 404, message: "service not found"}, null);
                    } else {
                        __logger.warn("RestHandler.request: got error updating service " + service_id + " info");
                        __logger.silly("RestHandler.request: trace:");
                        __logger.silly(error);

                        callback({code: 500, message: "internal server error, can not update database"}, null);
                    }

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

                            callback({code: 503, message: "can not reach service"}, null);

                        } else {
                            __logger.debug("RestHandler.request: success on contating with updated service " + service_id);

                            callback(null, response);
                        }
                    });
                }
            });
        } else {
            __logger.debug("RestHandler.request: success on contating with service " + service_id);

            callback(null, response);
        }
    });
}

/**
 * Forwards the request to the given domain.
 */
RestHandler.prototype.forwardRequest = function(domain_data, request_data, request_id, callback) {
    
    // TODO create url for external's domain broker
    
    // TODO, fake method
    //==========================
    RestMod.rest(url, method, headers, body, retries, function(error, response) {
    //==========================
        if(!response.status) {
            __logger.error("RestHandler.forwardRequest: Got error forwarding request " + request_id);
            __logger.debug("RestHandler.forwardRequest: Trace:");
            __logger.debug(response.error);

            callback({code: 503, message: "can not reach external domain"}, null);

        } else {
            __logger.debug("RestHandler.forwardRequest: Success on forwading request to external domain.");

            callback(null, response);
        }
    });
    
}

/**
 * Returns forwarded request to its origin
 */
RestHandler.prototype.forwardCallback = function(domain_data, callback_data, request_id, callback) {
    
    // TODO create url for external's domain broker

    // TODO, fake method
    //==========================
    RestMod.rest(url, method, headers, body, retries, function(error, response) {
    //==========================
        if(!response.status) {
            __logger.error("RestHandler.forwardCallback: Got error forwarding callback " + request_id);
            __logger.debug("RestHandler.forwardRforwardCallbackequest: Trace:");
            __logger.debug(response.error);

            callback({code: 503, message: "can not reach external domain"}, null);

        } else {
            __logger.debug("RestHandler.forwardCallback: Success on forwading request to external domain.");

            callback(null, response);
        }
    });
}