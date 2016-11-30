'use strict';

var request = require('request');
var PoError = require('./poError');
var fs = require('fs');

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
}

/**
 * Initializes the connection.
 * config: will be as defined in broker configuration, no processing will be applied
 */
Connector.prototype.connect = function(config, callback) {
    // Configuration load
    this.protocol = config.protocol;
    this.host = config.host;
    this.port = config.port;
    this.auth_token = config.auth_token;
    try {
        this.ca = fs.readFileSync(config.ca);
        this.certificate_key = fs.readFileSync(config.certificate_key);
        this.certificate = fs.readFileSync(config.certificate);
        callback(null); // no error
    } catch (error) {
        callback(error);
    }
}

/**
 * Starts the protection of the data identified by the body (serviceCallParameters)
 * @param {string} callbackUrl callback url where the PO will communicate the end of the protection process
 * @param {json} serviceCallParameters original request body with the protection data
 * @param {function} callback (error, protectionResponse, finalCallParameters) will return the control
 * to the main function.
 * If we set finalCallParameters, the protection process will end and the main function will continue the
 * forwarding process using the finalCallParameters as final body. As the control goes to the protection
 * orchestrator (PO) we will call this callback with the finalCallParameters param as null.
 * The control will resume when the PO uses the broker's callback API and the main module call the 
 * endProtection function.
 */
Connector.prototype.protect = function(callbackUrl, request_headers, serviceCallParameters, callback) {

    // TODO get host and port from services
    var url = 'http://' + this.host + ':' + this.port + '/execute/fs-riskscoring-createdataset/protect';
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
 * @param {json} serviceCallParameters original response body with the protection data
 * @param {function} callback (error, protectionResponse, finalCallParameters) will return the control
 * to the main function.
 * If we set finalCallParameters, the protection process will end and the main function will continue the
 * forwarding process using the finalCallParameters as final body. As the control goes to the protection
 * orchestrator (PO) we will call this callback with the finalCallParameters param as null.
 * The control will resume when the PO uses the broker's callback API and the main module call the 
 * endProtection function.
 */
Connector.prototype.unprotect = function(callbackUrl, request_headers, serviceCallParameters, callback) {

    // TODO get host and port from services
    var url = 'http://' + this.host + ':' + this.port + '/execute/fs-riskscoring-createdataset/unprotect';
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