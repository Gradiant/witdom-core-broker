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

var services = {
    po: {
        location: 'local',
        details: {
            service_id: "po",
            description: "PO component",
            uri: "192.168.0.10:8000",
            image: "image"
        }
    },
    storage: {
        location: 'local',
        details: {
            service_id: "storage",
            description: "Storage service component",
            uri: "192.168.0.14:3317",
            image: "image"
        }
    },
    error_service: {
        location: 'local',
        details: {
            service_id: "error_service",
            description: "Error service",
            uri: "errordomain:80",
            image: "image"
        }
    },
    ud_service: {
        location: 'broker_ud',
        details: {
            service_id: "ud_service",
            description: "Service from the UD",
            uri: "192.168.1.16:9000",
            image: "image"
        }
    }
};

module.exports.updateService = function(service_id, callback) {
    var service_info = services[service_id];
    if (service_info != undefined) {
        if (typeof callback === 'function') {
            callback(null, service_info);
        }
    } else {
        if (typeof callback === 'function') {
            callback({code:404, message: "Service not found"});
        }
    }
}

module.exports.findWithLocation = function(service_id, callback) {
    var service_info = services[service_id];
    if (service_info != undefined) {
        if (typeof callback === 'function') {
            callback(null, service_info);
        }
    } else {
        if (typeof callback === 'function') {
            callback({code:404, message: "Service not found"});
        }
    }
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
    var resServices = [];
    for (var property in services) {
        if (services.hasOwnProperty(property)) {
            if (services[property].location == 'local') {
                resServices.push(services[property].details);    
            }
        }
    }
    if (typeof callback === 'function') {
        callback(null, resServices);
    }
}

module.exports.outsideList = function(callback) {
    var resServices = [];
    for (var property in services) {
        if (services.hasOwnProperty(property)) {
            if (services[property].location != 'local') {
                resServices.push(services[property].details);    
            }
        }
    }
    if (typeof callback === 'function') {
        callback(null, resServices);
    }
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