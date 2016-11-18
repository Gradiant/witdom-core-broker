'use strict';

var brokerConfig = require('../config');
var orchestrator = require(brokerConfig.orchestrator.name).Orchestrator;

exports.serviceDetailsGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * user (String)
     * token (String)
     * service (String)
     **/

    // TODO, use database
    var service_id = args.service.value;
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
            var service = {
                service_id: service_id,
                image: service_data.image,
                description: service_data.description,
                uri: ""
            };
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(service || {}, null, 2));
        }
    });
}

exports.serviceDomainlistGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * user (String)
     * token (String)
     **/

    // TODO, use database
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
                    uri: ""
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

    // TODO, use database
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
                    uri: ""
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

