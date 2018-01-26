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

var request = require('request');
var PoError = require('./poError');
var fs = require('fs');
var ServiceInfo = require(__brokerConfig.serviceInfoModule);
var restCaller = require(__base + 'request/rest').Rest;

/**
 * Protection orchestration connector
 */
function Connector()
{
    // Data
    this.protocol;
    this.host;
    this.port;
    this.auth_token;
    this.ca;
    this.certificate_key;
    this.certificate;
    this.po_id;
    this.basepath;
}

/**
 * Initializes the connection.
 * config: will be as defined in broker configuration, no processing will be applied
 */
Connector.prototype.connect = function(config, callback) {
    // Configuration load
    this.protocol = config.protocol;
    
    //this.host = config.host;
    //this.host = po_info.uri.split(":")[0];
    //this.port = config.port;
    //this.port = po_info.uri.split(":")[1];
    //this.auth_token = config.auth_token;
    this.po_id = config.po_id;
    this.numberOfRetries = config.numberOfRetries;
    this.basepath = config.basepath;
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
 * Starts the protection of the data identified by the body (serviceCallParameters)
 * @param {string} callbackUrl callback url where the PO will communicate the end of the protection process
 * @param {json} service_info information of the service that was requested. It has three properties 'location', 'details' and 'protectionConfigurationId'.
 * 'location' can be 'local' or the domain name of the broker where the service is deployed, if its value is 'local'
 * the PO doesn't need to do anything and the request can be directly forwarded to the service, but if the value is
 * a domain name the request will be forwarded to the PO and after that it will be forwarded to the other domain.
 * @param {json} request_headers the original headers of the application request
 * @param {json} serviceCallParameters original request body with the protection data
 * @param {function} callback (error, protectionResponse, finalCallParameters) will return the control
 * to the main function.
 * If we set finalCallParameters, the protection process will end and the main function will continue the
 * forwarding process using the finalCallParameters as final body. As the control goes to the protection
 * orchestrator (PO) we will call this callback with the finalCallParameters param as null.
 * The control will resume when the PO uses the broker's callback API and the main module call the 
 * endProtection function.
 */
Connector.prototype.protect = function(callbackUrl, service_info, request_headers, serviceCallParameters, callback) {

    //Get the uri of the PO from services
    ServiceInfo.find(this.po_id, function(error, po_info) {
        if (error) {
            callback(error);
        } else {
            //var protect_url = this.protocol + '://' + po_info.uri + this.basepath + '/execute/' + service_info.details.service_id + '/protect';
            var protect_url = this.protocol + '://' + po_info.uri + this.basepath + '/execute/' + service_info.protectionConfigurationId + '/protect';
            __logger.silly("Connector.protect: Final url: " + protect_url);
            var headers = {};
            if (request_headers["x-auth-token"] || request_headers["X-Auth-Token"]) {
                headers['X-Auth-Token'] = request_headers["x-auth-token"] || request_headers["X-Auth-Token"];
            }
                        
            __logger.silly("Connector.protect: Headers:");
            __logger.silly(headers);
            var options = {
                url: protect_url,
                method: 'POST',
                headers: headers,
                //cert: this.certificate,
                //key: this.certificate_key,
                //ca: this.ca,
                //strictSSL: true,  // TODO forces agent not to be empty
                //agent: "¿?"
                json: true,
                body: {
                    callbackUrl: callbackUrl,
                    serviceCallParameters: serviceCallParameters || {}
                }
            };

            restCaller.doCall(protect_url,'POST', headers, options.body, this.numberOfRetries, function(error, response) { // TODO read number of retries from config
                if (error) {
                    // If we can not reach server, we return control to main function
                    callback(error, null, null);
                } else if (response) {
                    if (response.status == 200) {
                        // If success, we only set protectionResponse
                        //callback(null, response.text, null);
                        callback(null, response.body, null);
                    } else {
                        __logger.warn("Connector.protect: Unexpected response from PO");
                        __logger.debug("Connector.protect: Trace");
                        __logger.debug(response.status);
                        __logger.debug(response.text);
                        __logger.debug(response.body);
                        // If error in protection, we return control to main function
                        callback(new PoError(response.status, "error in protection process"), null, null);
                    }
                }
            });
            /*request(options, function(error, response, body) {
                if(error) {
                    // If we can not reach server, we return control to main function
                    callback(error, null, null);
                } else if(response) {
                    if(response.statusCode == 200) {
                        __logger.silly("Connector.protect: Successful response from PO");
                        // If success, we only set protectionResponse
                        callback(null, body, null);
                    } else {
                        __logger.warn("Connector.protect: Unexpected response from PO");
                        __logger.debug("Connector.protect: Trace");
                        __logger.debug(response.status);
                        __logger.debug(response.text);
                        __logger.debug(response.body);
                        // If error in protection, we return control to main function
                        callback(new PoError(response.status, "error in protection process"), null, null);
                    }
                } // Should exist either an error or a response, do not bother with more options
            });*/
        }
    }.bind(this));
}

/**
 * Ends the protection process by replacing the originalCallParameters body acording to the
 * receivedCallParameters.
 * @param {json} originalCallParameters original request body with the data to protect
 * @param {json} receivedCallParameters body received from the protection orchestrator (PO)
 * @param {function} callback (error, finalCallParameters) will return the control to the main function.
 * When we call this callback, the protection process will end and the main function will continue
 * the forwarding process using the finalCallParameters as final body.
 */
Connector.prototype.endProtection = function(originalCallParameters, receivedCallParameters, callback) {
    if( receivedCallParameters.status == "success" &&
        receivedCallParameters.results && 
        receivedCallParameters.results[0] &&
        receivedCallParameters.results[0].key == "modifiedServiceParams" &&
        receivedCallParameters.results[0].value)
    {
        // If everything is alright we return received results from PO as new body
        var unprotectParams = null;
        if (receivedCallParameters.results[1] &&
            receivedCallParameters.results[1].key == "unprotectParams" &&
            receivedCallParameters.results[1].value)
        {
            unprotectParams = receivedCallParameters.results[1].value;
        }
        callback(null, receivedCallParameters.results[0].value, unprotectParams);
    } else {
        // In other case we return an error
        callback(new PoError(receivedCallParameters.status, { process: "PO protect", failed_component: receivedCallParameters.failed_component }), null);
    }
}

/**
 * Starts the unprotection of the data identified by the body (serviceCallParameters)
 * @param {string} callbackUrl callback url where the PO will communicate the end of the protection process
 * @param {json} service_info information of the service that was requested. It has three properties 'location', 'details' and 'protectionConfigurationId'.
 * 'location' can be 'local' or the domain name of the broker where the service is deployed, if its value is 'local'
 * the PO doesn't need to do anything and the request can be directly forwarded to the service, but if the value is
 * a domain name the request will be forwarded to the PO and after that it will be forwarded to the other domain.
 * @param {json} request_headers the original headers of the application request
 * @param {json} serviceCallParameters original request body with the protection data
 * @param {function} callback (error, protectionResponse, finalCallParameters) will return the control
 * 
 * @param {json} serviceCallParameters original response body with the protection data
 * @param {function} callback (error, protectionResponse, finalCallParameters) will return the control
 * to the main function.
 * If we set finalCallParameters, the protection process will end and the main function will continue the
 * forwarding process using the finalCallParameters as final body. As the control goes to the protection
 * orchestrator (PO) we will call this callback with the finalCallParameters param as null.
 * The control will resume when the PO uses the broker's callback API and the main module call the 
 * endProtection function.
 */
Connector.prototype.unprotect = function(callbackUrl, service_info, request_headers, serviceCallParameters, callback) {

    //Get the uri of the PO from services
    ServiceInfo.find(this.po_id, function(error, po_info) {
        if (error) {
            callback(error);
        } else {
            //var unprotect_url = this.protocol + '://' + po_info.uri + this.basepath + '/execute/' + service_info.details.service_id + '/unprotect';
            var unprotect_url = this.protocol + '://' + po_info.uri + this.basepath + '/execute/' + service_info.protectionConfigurationId + '/unprotect';
            __logger.silly("Connector.unprotect: Final url: " + unprotect_url);
            var headers = {};
            if (request_headers["x-auth-token"] || request_headers["X-Auth-Token"]) {
                headers['X-Auth-Token'] = request_headers["x-auth-token"] || request_headers["X-Auth-Token"];
            }
            __logger.silly("Connector.unprotect: Headers:");
            __logger.silly(request_headers);
            var options = {
                url: unprotect_url,
                method: 'POST',
                headers: headers,
                //cert: this.certificate,
                //key: this.certificate_key,
                //ca: this.ca,
                //strictSSL: true,  // TODO forces agent not to be empty
                //agent: "¿?"
                json: true,
                body: {
                    callbackUrl: callbackUrl,
                    serviceCallParameters: serviceCallParameters || {}
                }
            };

            restCaller.doCall(unprotect_url,'POST', headers, options.body, this.numberOfRetries, function(error, response) { // TODO read number of retries from config
                if (error) {
                    // If we can not reach server, we return control to main function
                    callback(error, null, null);
                } else if (response) {
                    if (response.status == 200) {
                        __logger.silly("Connector.unprotect: Successful response from PO");
                        // If success, we only set protectionResponse
                        //callback(null, response.text, null);
                        callback(null, response.body, null);
                    } else {
                        __logger.warn("Connector.unprotect: Unexpected response from PO");
                        __logger.debug("Connector.unprotect: Trace");
                        __logger.debug(response.status);
                        __logger.debug(response.text);
                        __logger.debug(response.body);
                        // If error in unprotection, we return control to main function
                        callback(new PoError(response.status, "error in unprotection process"), null, null);
                    }
                }
            });
/*            request(options, function(error, response, body) {
                if(error) {
                    // If we can not reach server, we return control to main function
                    callback(error, null, null);
                } else if(response) {
                    if(response.statusCode == 200) {
                        __logger.silly("Connector.unprotect: Successful response from PO");
                        // If success, we only set protectionResponse
                        callback(null, body, null);
                    } else {
                        __logger.warn("Connector.unprotect: Unexpected response from PO");
                        __logger.debug("Connector.unprotect: Trace");
                        __logger.debug(response.status);
                        __logger.debug(response.text);
                        __logger.debug(response.body);
                        // If error in unprotection, we return control to main function
                        callback(new PoError(response.status, "error in unprotection process"), null, null);
                    }
                } // Should exist either an error or a response, do not bother with more options
            });*/
        }
    }.bind(this));
}

/**
 * Ends the unprotection process by replacing the originalCallParameters body acording to the
 * receivedCallParameters.
 * @param {json} originalCallParameters original response body with the data to unprotect
 * @param {json} receivedCallParameters body received from the protection orchestrator (PO)
 * @param {function} callback (error, finalCallParameters) will return the control to the main function.
 * When we call this callback, the protection process will end and the main function will continue
 * the forwarding process using the finalCallParameters as final body.
 */
Connector.prototype.endUnprotection = function(originalCallParameters, receivedCallParameters, callback) {
    
    if( receivedCallParameters.status == "success" &&
        receivedCallParameters.results && 
        receivedCallParameters.results[0] &&
        receivedCallParameters.results[0].key == "modifiedServiceParams" &&
        receivedCallParameters.results[0].value)
    {
        // If everything is alright we return received results from PO as new body
        callback(null, receivedCallParameters.results[0].value);
    } else {
        // In other case we return an error
        callback(new PoError(receivedCallParameters.status, { process: "PO unprotect", failed_component: receivedCallParameters.failed_component }), null);
    }
}

/**
 * Calls the PO method to get the process status
 * @param {string} processInstanceId The ID of the process instance
 * @param {object} request_headers The request headers to pass in the request to the PO
 * @param {function} callback A callback function used to return the result to the caller
 */
Connector.prototype.getProcessStatus = function(processInstanceId, request_headers, callback) {
    //Get the uri of the PO from services
    ServiceInfo.find(this.po_id, function(error, po_info) {
        if (error) {
            callback(error);
        } else {
            var status_url = this.protocol + '://' + po_info.uri + this.basepath + '/processstatus/' + processInstanceId;
            __logger.silly("Connector.getProcessStatus: Final url: " + status_url);
            var headers = {};
            if (request_headers["x-auth-token"] || request_headers["X-Auth-Token"]) {
                headers['X-Auth-Token'] = request_headers["x-auth-token"] || request_headers["X-Auth-Token"];
            }
            __logger.silly("Connector.getProcessStatus: Headers:");
            __logger.silly(headers);

            restCaller.doCall(status_url, 'GET', headers, null, this.numberOfRetries, function(error, response) { // TODO read number of retries from config
                if (error) {
                    // If we can not reach server, we return control to main function
                    callback(error, null);
                } else if (response) {
                    if (response.status == 200) {
                        __logger.silly("Connector.getProcessStatus: Successful response from PO");
                        // If success, we only set protectionResponse
                        callback(null, response.body);
                    } else if (response.status == 404) {
                        __logger.silly("Connector.getProcessStatus: processInstanceId doesn't exist");
                        callback(new PoError(response.status, "Requested process doesn't exist"));
                    } else {
                        __logger.warn("Connector.getProcessStatus: Unexpected response from PO");
                        __logger.debug("Connector.getProcessStatus: Trace");
                        __logger.debug(response.status);
                        __logger.debug(response.text);
                        __logger.debug(response.body);
                        // If error in getProcessStatus, we return control to main function
                        callback(new PoError(response.status, "error in processstatus"));
                    }
                }
            });
        }
    }.bind(this));
}

var connector = module.exports = exports = new Connector;