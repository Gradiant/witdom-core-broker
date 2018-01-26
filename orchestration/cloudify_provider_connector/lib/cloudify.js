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

var unirest = require('unirest');
var OrchestrationError = require('./cloudifyError');
var fs = require('fs');

/**
 * Cloudify orchestration connector
 */
function Connector()
{
    // Data
    this.protocol;
    this.host;
    this.port;
    //this.auth_token;
    this.ca;
    this.certificate_key;
    this.certificate;
}

/**
 * Initializes the connection.
 * config: will be as defined in broker configuration, no processing will be applied
 */
Connector.prototype.connect = function(config, callback) {
    // Configuration load
    this.protocol = config.protocol || "http";
    this.host = config.host;
    this.port = config.port;
    //this.auth_token = config.auth_token;
    try {
        //this.ca = fs.readFileSync(config.ca);
        //this.certificate_key = fs.readFileSync(config.certificate_key);
        //this.certificate = fs.readFileSync(config.certificate);
        callback(null); // no error
    } catch (error) {
        callback(error);
    }
}

/**
 * Gets the information of the service identified by the given service name
 */
Connector.prototype.getServiceData = function(service, callback) {

    var checked = 0;
    var given_name = service;
    var self = this;
    self.getServiceList(function(error, services) {
        if(error) {
            callback(error, null);
        } else {
            for(var index in services) {
                if(services[index].name == given_name) {
                    callback(null, services[index]);
                    return;
                }
            }
            callback(new OrchestrationError(404, "Unknown service"), null);
        }
    });
};  

/**
 * Gets the information of all the services deployed
 */
Connector.prototype.getServiceList = function(callback) {
    
    var serviceList = [];
    var self = this;
    this.getDeploymentList(function(error, deployments) {
        if(error) {
            console.log("can not connect with cloudify");
            //callback(new OrchestrationError(response.status, response.error), null);
            callback(error, null);
        } else {
            self.addDeploymentServices(serviceList, deployments, callback);
        }
    });
};

/**
 * Recursive add services to serviceList
 */
Connector.prototype.addDeploymentServices = function(serviceList, deployments, callback) {
    var self = this;
    //console.log(serviceList.length)
    //console.log(deployments.length)
    if(deployments.length == 0) {
        callback(null, serviceList);
    } else {
        var deployment_id = deployments[0];
        deployments.shift();
        var url = self.protocol + '://' + self.host + ':' + self.port + '/deployments/' + deployment_id + '/outputs';
        unirest.get(url)
            .end(function(response) {
                //console.log("deployment");
                if(response.status != 200) {
                    //callback(new OrchestrationError(response.status, response.error), null);
                    self.addDeploymentServices(serviceList, deployments, callback);
                } else {
                    if(response.body && response.body.outputs) {
                        var outputs = response.body.outputs;
                        var services = Object.keys(outputs);
                        for(var index in services) {
                            //console.log("service");
                            var service_name = services[index];
                            //console.log(service_name)
                            var service = outputs[service_name];
                            if(service && service.port && service.host) {
                                try {
                                    serviceList.push({
                                        name: service_name,
                                        host: service.host,
                                        port: service.port,
                                        description: service.description || "",
                                        image: service.image || ""
                                    });
                                } catch (error) {
                                }
                            }
                        }
                        self.addDeploymentServices(serviceList, deployments, callback);
                    }
                }
            });
    }
}

/**
 * Gets the information of all the deployments
 */
Connector.prototype.getDeploymentList = function(callback) {

    var url = this.protocol + '://' + this.host + ':' + this.port + '/api/v2/deployments';

    unirest.get(url)
        .end(function(response) {
            if(response.status != 200) {
                callback(new OrchestrationError(response.status, response.error), null);
            } else {
                //console.log(JSON.stringify(response.body.items, null, 2))
                var deploymentList = [];
                for(var index in response.body.items) {
                    //console.log(index);
                    var deployment = response.body.items[index];
                    if(deployment) {
                        var deployment_id = deployment.blueprint_id;
                        if(deployment_id) {
                            deploymentList.push(deployment_id);
                        }
                    }
                }
                callback(null, deploymentList);
            }
        });

}

var connector = module.exports = exports = new Connector;