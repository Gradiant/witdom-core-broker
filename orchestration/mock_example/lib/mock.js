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
'use strict';

var OrchestrationError = require('./mockError');

/**
 * Example orchestration connector
 * config: will be as defined in broker configuration, no processing will be applied
 */
function Connector()
{
    // Example data
    this.services;
}

/**
 * Initializes the connection.
 * If authentication is required, should be done here
 */
Connector.prototype.connect = function(config, callback) {
    // Example configuration load
    this.services = config.services || {};
    callback(null); // no error
}


/**
 * Gets the information of the service identified by the given service name
 */
Connector.prototype.getServiceData = function(service, callback) {
    if (!this.services) {
        callback(new OrchestrationError(503, "Connector not inialized"));
    } else if(this.services[service]) {
        var service_data = {
            "image": "image_url",
            "host": this.services[service].host,
            "port": this.services[service].port,
            "description": "service_description"
        };
        callback(null, service_data);
    } else {
        callback(new OrchestrationError(404, "Unknown service"), null)
    }
};  

/**
 * Gets the information of all the services deployed.
 */
Connector.prototype.getServiceList = function(callback) {
    if (!this.services) {
        callback(new OrchestrationError(503, "Connector not inialized"));
    } else {
        var services_response = [];
        var names = Object.keys(this.services);
        for(var index in names) {
            services_response.push({
                "name": names[index],
                "image": "image_url",
                "host": this.services[names[index]].host,
                "port": this.services[names[index]].port,
                "description": "service_description"
            });
        }
        callback(null, services_response);
    }
};

var connector = module.exports = exports = new Connector;