'use strict';

var brokerConfig = require('../config');
var orchestrator = require(brokerConfig.orchestrator.name).Orchestrator;
var mongoose = require('mongoose');
var Service = require('../models/mongo/service');
var ServiceInfo = require(__base + 'service_info/ServiceInfo');

function sendResponse(error, response_data, next) {
    if (error) {
        response.setHeader('Content-Type', 'application/json');
        response.writeHead(error.code);
        respone.end(JSON.stringify({message: [error]}));
    } else {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(response_data || {}, null, 2));
    } 
    next();
}

exports.serviceDetailsGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * service (String)
     * xAuthToken (String)
     **/
    
    // Retrieve from database
    var service_id = args.service.value;

    ServiceInfo.find(service_id, function(error, service) {
        sendResponse(error, service, next);
    });    
}

exports.serviceDomainlistGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * xAuthToken (String)
     **/

    // Retrive from database with local source
    ServiceInfo.domainList(function(error, services) {
        sendResponse(error, services, next);
    });
}

exports.serviceListGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * xAuthToken (String)
     **/

    // TODO, how to use database
    ServiceInfo.list(function(error, services) {
        sendResponse(error, services, next);
    });
}

exports.serviceOutsidelistGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * xAuthToken (String)
     **/

    // TODO retrieve services from untrusted domains
    ServiceInfo.outsideList(function(error, services) {
        sendResponse(error, services, next);
    });
}

