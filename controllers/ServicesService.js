'use strict';

var brokerConfig = require('../config');
var orchestrator = require(brokerConfig.orchestrator.name).Orchestrator;
var mongoose = require('mongoose');
var Service = require('../models/mongo/service');

exports.serviceDetailsGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * user (String)
     * token (String)
     * service (String)
     **/

    // Retrieve from database
    var service_id = args.service.value;
    Service.findById(service_id, function(error, service) {
        if(error) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(500);
            response.end(JSON.stringify({code: 500, reason: "internal server error"}));
        } else if(service) {
            var service_response = {
                service_id: service.id,
                image: service.service_data.image,
                description: service.service_data.description,
                uri: "??"
            };
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(service_response || {}, null, 2));
        } else {
            // Retrieve from orchestrator module
            orchestrator.getServiceData(service_id, function(error, service_data) {
                if(error){
                    response.setHeader('Content-Type', 'application/json');
                    if(error.code == 404) {
                        response.writeHead(404);
                        response.end(JSON.stringify({code: 404, reason: error.reason}));
                    } else {
                        response.writeHead(503);
                        response.end(JSON.stringify({code: 503, reason: "service unavaliable"}));
                    }
                } else {
                    var service_response = {
                        service_id: service_id,
                        image: service_data.image,
                        description: service_data.description,
                        uri: "??"
                    };
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify(service_response || {}, null, 2));
                }
            });
        }
    });
}

exports.serviceDomainlistGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * user (String)
     * token (String)
     **/

    // TODO, how to use database
    // Only retrieve services from current domain
    orchestrator.getServiceList(function(error, services) {
        if(error) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(503);
            response.end(JSON.stringify({code: 503, reason: "service unavaliable"}));
        } else {
            var services_response = [];
            for(var index in services) {
                var service = {
                    service_id: services[index].name,
                    image: services[index].image,
                    description: services[index].description,
                    uri: "??"
                };
                services_response.push(service);
            }
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(services_response || [], null, 2));
        }
    });  
}

exports.serviceListGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * user (String)
     * token (String)
     **/

    // TODO, how to use database
    // Retrieve services from current domain
    orchestrator.getServiceList(function(error, services) {
        if(error) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(503);
            response.end(JSON.stringify({code: 503, reason: "service unavaliable"}));
        } else {
            var services_response = [];
            for(var index in services) {
                var service = {
                    service_id: services[index].name,
                    image: services[index].image,
                    description: services[index].description,
                    uri: "??"
                };
                services_response.push(service);
            }
            // TODO retrieve services from untrusted domains
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(services_response || [], null, 2));
        }
    });
}

exports.serviceOutsidelistGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * user (String)
     * token (String)
     **/

    // TODO retrieve services from untrusted domains
    var services_response = [];
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(services_response || [], null, 2));
  
}

