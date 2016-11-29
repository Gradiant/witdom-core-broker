'use strict'

var Service = require('../models/mongo/service');
var request = require('superagent');
var fs = require('fs');
var _ = require("lodash");
var orchestrator = require(__brokerConfig.orchestrator.name).Orchestrator;

var options = {
    //key: fs.readFileSync(config.https.broker_key),
    key: fs.readFileSync(__base + __brokerConfig.https.broker_key),
    passphrase: __brokerConfig.https.broker_key_passphrase, 
    cert: fs.readFileSync(__base + __brokerConfig.https.broker_cert),
    ca: fs.readFileSync(__base + __brokerConfig.https.ca_cert),
};

var broker_ed = request.agent(options);
var url_prefix = __brokerConfig.protocol + "://" + __brokerConfig.broker_ed.domain_name + ":" + __brokerConfig.broker_ed[__brokerConfig.protocol].port +"/v1";


function getOtherDomainsServices(callback) {
    //TODO: we should have an array of other domains brokers
    broker_ed.get(url_prefix + '/service/domainlist').end(function(error, response) {
        if (error) {
            var serviceInfoError = {code: 500, message: "Internal server error"};
            if (typeof callback === 'function') {
                callback(servceInfoError);
            }
        } else {
            if (response.status == 200) { // The other domain returned its service list
                //Save services in the database
                response.body.forEach(function(service) {
                    if (service.service_id == service_id) {
                        foundService = service;
                    }
                    var db_service = {
                        "image": service.image,
                        //"host": service.uri.split("://")[1].split(":")[0],
                        //"port": service.uri.split("://")[1].split(":")[1] || service.uri.split("://")[0]=="http"?"80":"443",
                        "host": service.uri.split(":")[0],
                        "port": service.uri.split(":")[1],
                        "description": service.description
                    };
                    Service.saveOrUpdate(service.service_id, __brokerConfig.broker_ed.domain_name, db_service, function() {//Save the service to local database

                    });
                    
                });

                if (typeof callback === 'function') {
                    callback(null, response.body);
                }
            } else if (response.status == 503) { // The orchestrator of the other domain didn't answer
                if (typeof callback === 'function') {
                    callback({code:503, message: "Service unavailable"});
                }
            } else if (response.status == 500) { // The other domain broker couldn't access its local database
                if (typeof callback === 'function') {
                    callback({code:500, message: "Internal server error"});
                }
            } else {
                console.log(response.status + ":" + response.body);
                if (typeof callback === 'function') {
                    callback({code:500, message: "Internal server error"});
                }
            }
        }
    });
}

module.exports.find = function(service_id, callback) {
    Service.findById(service_id, function(error, service) {
        if(error) {
            var serviceInfoError = {code: 500, message: "Internal server error"};
            if (typeof callback === 'function') {
                callback(serviceInfoError);
            }
        } else if(service) {
            if (typeof callback === 'function') {
                var service_response = {
                    service_id: service.id,
                    image: service.service_data.image,
                    description: service.service_data.description,
                    uri: service.service_data.host + ':' + service.service_data.port
                };
                callback(null, service_response);
            }
        } else {
            // Retrieve from orchestrator module
            orchestrator.getServiceData(service_id, function(error, service_data) {
                if(error) {
                    if(error.code == 404) { // Service not found in local orchestrator try to find it in other domain
                        // TODO retrieve from untrusted domains
                        broker_ed.get(url_prefix + '/service/domainlist').end(function(error, response) {
                            if (error) {
                                var serviceInfoError = {code: 500, message: "Internal server error"};
                                if (typeof callback === 'function') {
                                    callback(servceInfoError);
                                }
                            } else {
                                if (response.status == 200) { // The other domain returned its service list
                                    var foundService = undefined;
                                    response.body.forEach(function(service) {
                                        if (service.service_id == service_id) {
                                            foundService = service;
                                        }
                                        var db_service = {
                                            "image": service.image,
                                            //"host": service.uri.split("://")[1].split(":")[0],
                                            //"port": service.uri.split("://")[1].split(":")[1] || service.uri.split("://")[0]=="http"?"80":"443",
                                            "host": service.uri.split(":")[0],
                                            "port": service.uri.split(":")[1],
                                            "description": service.description
                                        };
                                        Service.saveOrUpdate(service.service_id, __brokerConfig.broker_ed.domain_name, db_service, function() {//Save the service to local database

                                        });
                                        
                                    });
                                    if (typeof callback === 'function') {
                                        if (foundService) {
                                            callback(null, foundService);
                                        } else {
                                            callback({code:404, message: "Service not found"});
                                        }
                                    }
                                } else if (response.status == 503) { // The orchestrator of the other domain didn't answer
                                    if (typeof callback === 'function') {
                                        callback({code:503, message: "Service unavailable"});
                                    }
                                } else if (response.status == 500) { // The other domain broker couldn't access its local database
                                    if (typeof callback === 'function') {
                                        callback({code:500, message: "Internal server error"});
                                    }
                                } else {
                                    console.log(response.status + ":" + response.body);
                                    if (typeof callback === 'function') {
                                        callback({code:500, message: "Internal server error"});
                                    }
                                }
                            }
                        });

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
                    var newService = new Service({id: service_id, source: 'local', service_data: service_data});
                    newService.save();
                    if (typeof callback === 'function') {
                        callback(null, service_response)
                    }
                }
            });
        }
    });
}

module.exports.domainList = function(callback) {
    Service.find({source: 'local'}, function(error, services) {
        if(error) {
            if (typeof callback === 'function') {
                callback({code: 500, message: "Internal server error"});
            }
        } else if(services.length == 0) { // Means we don't have any local services in the database yet'
            // Only retrieve services from current domain
            orchestrator.getServiceList(function(error, services) {
                if(error) {
                    if (typeof callback === 'function') {
                        callback({code: 503, message: "Service unavailable"});
                    }
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
                    if (typeof callback === 'function') {
                        callback(null, services_response);
                    }
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
            if (typeof callback === 'function') {
                callback(null, services_response);
            }
        }
    }); 
}

module.exports.outsideList = function(callback) {
    Service.find({source: {$ne:'local'}}, function(error, services) {
        if(error) {
            if (typeof callback === 'function') {
                callback({code: 500, message: "Internal server error"});
            }
        } else if(services.length == 0) { // Means we don't have any services from other domains in the database yet
            //request the services from the other domains
            getOtherDomainsServices(function(error, od_services) {
                if(error) {
                    if (typeof callback === 'function') {
                        callback(error);
                    }
                } else {
                    if (typeof callback === 'function') {
                        callback(null, od_services);
                    }
                }
            });
        } else {
            // There are services from other domains in the database
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
            if (typeof callback === 'function') {
                callback(null, services_response);
            }
        }
    }); 
}

module.exports.list = function(callback) {
    domainList(function(error, domain_services) {
        if (error) {
            if (typeof callback === 'function') {
                callback(error);
            }
        } else {
            outsideList(function(error, outside_services) {
                if (error) {
                    if (typeof callback === 'function') {
                        callback(error);
                    }
                } else {
                    services = _.merge({}, domain_services, outside_services);
                    if (typeof callback === 'function') {
                        callback(null, services);
                    }
                }
            });
        }
    });
    
}