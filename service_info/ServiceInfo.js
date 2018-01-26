/*
 *   Copyright (C) 2017  Gradiant <https://www.gradiant.org/>
 *
 *   This file is part of WITDOM Core Broker
 *
 *   WITDOM Core Broker is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   WITDOM Core Broker is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
'use strict'

var Service = require('../models/mongo/service');
//var request = require('superagent');
var fs = require('fs');
var orchestrator = require(__brokerConfig.orchestrator.name).Orchestrator;
var restCaller = require('../request/rest').Rest;


var options = {
    //key: fs.readFileSync(__base + __brokerConfig.https.broker_key),
    //passphrase: __brokerConfig.https.broker_key_passphrase, // This doesn't work with superagent 
    //cert: fs.readFileSync(__base + __brokerConfig.https.broker_cert),
    //ca: fs.readFileSync(__base + __brokerConfig.https.ca_cert),
};

//var broker_ed = request.agent(options);
//var broker_ed = request.agent(__brokerConfig.httpsOptions);
var url_prefix = __brokerConfig.protocol + "://" + __brokerConfig.broker_ed.domain_name + ":" + __brokerConfig.broker_ed[__brokerConfig.protocol].port +"/v1";

__logger.info("ServiceInfo: url_prefix: " + url_prefix);

function getOtherDomainsServices(callback) {
    //TODO: we should have an array of other domains brokers
    restCaller.doCall(url_prefix + '/service/domainlist','GET', {}, {}, __brokerConfig.numberOfRetries, function(error, response) {
    //broker_ed.get(url_prefix + '/service/domainlist').end(function(error, response) {
        if (error) {
            __logger.info("url: " + url_prefix + "/service/domainlist");
            __logger.warn("ServiceInfo.getOtherDomainsServices: Error contacting with other domains.");
            __logger.debug("ServiceInfo.getOtherDomainsServices: Trace:");
            __logger.debug(error);
            var serviceInfoError = {code: 500, message: "Internal server error"};
            if (typeof callback === 'function') {
                callback(serviceInfoError);
            }

        } else {
            if (response.status == 200) { // The other domain returned its service list
                //Save services in the database
                response.body.forEach(function(service) {
                    var db_service = {
                        "image": service.image,
                        //"host": service.uri.split("://")[1].split(":")[0],
                        //"port": service.uri.split("://")[1].split(":")[1] || service.uri.split("://")[0]=="http"?"80":"443",
                        "host": service.uri.split(":")[0],
                        "port": service.uri.split(":")[1],
                        "description": service.description
                    };
                    //Save the service to local database
                    Service.saveOrUpdate(service.service_id, __brokerConfig.broker_ed.domain_name, db_service, function() {});
                    
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
                //console.log(response.status + ":" + response.body);
                if (typeof callback === 'function') {
                    callback({code:500, message: "Internal server error"});
                }
            }
        }
    });
}

module.exports.updateService = function(service_id, callback) {
    // Retrieve from orchestrator module
    // TODO: since getServiceData in the Cloudify connector calls the method getServiceList, maybe is better to just call getServiceList and update the list in mongo database
    orchestrator.getServiceData(service_id, function(error, service_data) {
        if(error) {
            if(error.code == 404) { // Service not found in local orchestrator try to find it in other domain
                __logger.debug("ServiceInfo.updateService: Service not found in local domain. Look for it in other domains.");
                getOtherDomainsServices(function(error, services) {
                    if(error) {
                        __logger.warn("ServiceInfo.updateService: Error contacting with other domains.")
                        __logger.debug("ServiceInfo.updateService: Trace:")
                        __logger.debug(error);
                        if (typeof callback === 'function') {
                            callback(error);
                        }
                    } else {
                        __logger.silly("ServiceInfo.updateService: found " + services.length + " services");
                        for(var index in services) {
                            if(services[index].service_id == service_id) {
                                if (typeof callback === 'function') {
                                    callback(null, {location: __brokerConfig.broker_ed.domain_name, details: services[index]});
                                    return;
                                }
                            }
                        }
                        if (typeof callback === 'function') {
                            __logger.debug("ServiceInfo.updateService: Service not found in others domains.");
                            callback({code:404, message: "Service not found"});
                            // TODO: delete services from database??
                            Service.remove({id: service_id}, function(error, removeResult) {
                                if (removeResult) {
                                    //console.log(removeResult.result);
                                }
                            });
                        }
                    }
                });
            } else {
                __logger.warn("ServiceInfo.updateService: Can not reach orchestration service.");
                callback({code: 503, reason: "service unavaliable"});
                // TODO: delete services from database??
                Service.remove({id: service_id}, function(error, removeResult) {
                    if (removeResult) {
                        //console.log(removeResult.result);
                    }
                });
            }
        } else {
            __logger.silly("ServiceInfo.updateService: Found service " + service_id);
            var service_response = {
                service_id: service_id,
                description: service_data.description,
                uri: service_data.host + ':' + service_data.port,
                image: service_data.image
            };
            Service.saveOrUpdate(service_id, 'local', service_data, function(error, service) {});
            if (typeof callback === 'function') {
                //console.log("Service " + service_response.service_id + " found in the local orchestrator");
                callback(null, {location: 'local', details: service_response});
            }
        }
    });
}

module.exports.findWithLocation = function(service_id, callback) {
    var self = this;
    Service.findById(service_id, function(error, service) {
        if(error) {
            __logger.warn("ServiceInfo.findWithLocation: Got error accesing database for service " + service_id);
            __logger.debug("ServiceInfo.findWithLocation: Trace:");
            __logger.silly(error);
            var serviceInfoError = {code: 500, message: "Internal server error"};
            if (typeof callback === 'function') {
                callback(serviceInfoError);
            }
        } else if(service) {
            if (typeof callback === 'function') {
                var service_response = {
                    service_id: service.id,
                    description: service.service_data.description,
                    uri: service.service_data.host + ':' + service.service_data.port,
                    image: service.service_data.image
                };
                //console.log("Service " + service_response.service_id + " found in the database (" + service.source +")");
                callback(null, {location: service.source, details: service_response});
            }
        } else {
            // Update service
            __logger.debug("ServiceInfo.findWithLocation: Service " + service_id + " not found. Updating.");
            self.updateService(service_id, callback);
        }
    });
}

module.exports.find = function(service_id, callback) {
    this.findWithLocation(service_id, function(error, service_info) {
        if (error) {
            if (typeof callback === 'function') {
                callback(error);
            }
        } else {
            if (typeof callback === 'function') {
                callback(null, service_info.details);
            }
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
                            description: services[index].description,
                            uri: services[index].host + ':' + services[index].port,
                            image: services[index].image                            
                        };
                        services_response.push(service);
                        //console.log("Found service locally: " + JSON.stringify(service));
                    }
                    if (typeof callback === 'function') {
                        callback(null, services_response);
                    }
                    // Save all services to database
                    services.forEach(function(service) {
                        Service.saveOrUpdate(service.name, 'local', service, function(error, service) {});
                        /*var newService = new Service({id: service.name, source: 'local', service_data: service});
                        newService.save();*/
                    })
                }
            }); 
        } else {
            // There are services in the database
            var services_response = [];
            for(var index in services) {
                var service = {
                    service_id: services[index].id,
                    description: services[index].service_data.description,
                    uri: services[index].service_data.host + ":" + services[index].service_data.port,
                    image: services[index].service_data.image                    
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
                    description: services[index].service_data.description,
                    uri: services[index].service_data.host + ":" + services[index].service_data.port,
                    image: services[index].service_data.image
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
    this.domainList(function(error, domain_services) {
        if (error) {
            if (typeof callback === 'function') {
                callback(error);
            }
        } else {
            this.outsideList(function(error, outside_services) {
                if (error) {
                    if (typeof callback === 'function') {
                        callback(error);
                    }
                } else {
                    var services = domain_services.concat(outside_services);
                    if (typeof callback === 'function') {
                        callback(null, services);
                    }
                }
            });
        }
    }.bind(this));
    
}