'use strict';

var request = require('request');
var PoError = require('./poError');
var fs = require('fs');
var ServiceInfo = require(__brokerConfig.serviceInfoModule);

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
 * @param {json} service_info information of the service that was requested. It has two properties 'location' and 'details'.
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
            var url = this.protocol + '://' + po_info.uri + '/execute/' + service_info.details.service_id + '/protect';
            var headers = {
                "X-Auth-Token": request_headers["X-Auth-Token"]
            };
            var options = {
                url: url,
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
                    serviceCallParameters: serviceCallParameters
                }
            };

            request(options, function(error, response, body) {
                if(error) {
                    // If we can not reach server, we return control to main function
                    callback(error, null, null);
                } else if(response) {
                    if(response.statusCode == 200) {
                        // If success, we only set protectionResponse
                        callback(null, body, null);
                    } else {
                        // If error in protection, we return control to main function
                        callback(new PoError(response.status, "error in protection process"), null, null);
                    }
                } // Should exist either an error or a response, do not bother with more options
            });
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
        callback(null, receivedCallParameters.results[0].value);
    } else {
        // In other case we return an error
        callback(new PoError(receivedCallParameters.status, "error protecting data"), null);
    }
}

/**
 * Starts the unprotection of the data identified by the body (serviceCallParameters)
 * @param {string} callbackUrl callback url where the PO will communicate the end of the protection process
 * @param {json} service_info information of the service that was requested. It has two properties 'location' and 'details'.
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
            var url = this.protocol + '://' + po_info.uri + '/execute/' + service_info.details.service_id + '/unprotect';
            var headers = {
                "X-Auth-Token": request_headers["X-Auth-Token"]
            };
            var options = {
                url: url,
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
                    serviceCallParameters: serviceCallParameters
                }
            };

            request(options, function(error, response, body) {
                if(error) {
                    // If we can not reach server, we return control to main function
                    callback(error, null, null);
                } else if(response) {
                    if(response.statusCode == 200) {
                        // If success, we only set protectionResponse
                        callback(null, body, null);
                    } else {
                        // If error in protection, we return control to main function
                        callback(new PoError(response.status, "error in unprotection process"), null, null);
                    }
                } // Should exist either an error or a response, do not bother with more options
            });
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
        callback(new PoError(receivedCallParameters.status, "error protecting data"), null);
    }
}

var connector = module.exports = exports = new Connector;