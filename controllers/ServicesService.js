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
                uri: service.service_data.host + ':' + service.service_data.port
            };
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(service_response || {}, null, 2));
        } else {
            // Retrieve from orchestrator module
            orchestrator.getServiceData(service_id, function(error, service_data) {
                if(error){
                    response.setHeader('Content-Type', 'application/json');
                    if(error.code == 404) {
                        // TODO retrieve from untrusted domains
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
                        uri: service_data.host + ':' + service_data.port
                    };
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify(service_response || {}, null, 2));
                    var newService = new Service({id: service_id, source: 'local', service_data: service_data});
                    newService.save();
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

    // Retrive from database with local source
    Service.find({source: 'local'}, function(error, services) {
        if(error) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(500);
            response.end(JSON.stringify({code: 500, reason: "internal server error"}));
        } else if(services.length == 0) {
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
                            uri: services[index].host + ':' + services[index].port
                        };
                        services_response.push(service);
                    }
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify(services_response || [], null, 2));
                    // Save all services to database
                    services.forEach(function(service) {
                        var newService = new Service({id: service.name, source: 'local', service_data: service_data});
                        newService.save();
                    })
                }
            }); 
        } else {
            // There are services in the database
            var services_response = [];
            for(var index in services) {
                var service = {
                    service_id: services[index].id,
                    image: services[index].service_data.image,
                    description: services[index].service_data.description,
                    uri: services[index].service_data.host + ":" + services[index].service_data.port
                }
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
    Service.find({}, function(error, services) {
        if(error) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(500);
            response.end(JSON.stringify({code: 500, reason: "internal server error"}));
        } else if(services.length == 0) {
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
                            uri: services[index].host + ':' + services[index].port
                        };
                        services_response.push(service);
                    }
                    // TODO retrieve services from untrusted domains
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify(services_response || [], null, 2));
                    // Save all services to database
                    services.forEach(function(service) {
                        var newService = new Service({id: service.name, source: 'local', service_data: service});
                        newService.save();
                    })
                }
            });
        } else {
            // There are services in the database
            var services_response = [];
            for(var index in services) {
                var service = {
                    service_id: services[index].id,
                    image: services[index].service_data.image,
                    description: services[index].service_data.description,
                    uri: services[index].service_data.host + ":" + services[index].service_data.port
                }
                services_response.push(service);
            }
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

