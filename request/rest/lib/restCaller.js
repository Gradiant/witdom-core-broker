'use strict';

var request = require('superagent');
var restError = require('./restError');

/**
 * Class for doing rest calls with configured HTTPS options
 */
function Caller() {
    this.agent;
    this.options;
    this.initialized = false;
}

/**
 * Initialize rest agent with suplied options.
 * If no timeout is provied it is set to '0'
 */
Caller.prototype.init = function(options) {
    this.options = options;
    this.options.timeout = this.options.timeout || 0;
    this.agent = request.agent(options);
    this.initialized = true;
}

/**
 * Makes the REST call to the supplied endpoint using the provided parameters.
 * When the call ends the provided callback is invoked.
 * @param {string} url URL to make the call to.
 * @param {string} method Method to use in the call [POST|GET]
 * @param {json} headers Headers to include in the call passed in a JSON object as pairs of 'header name':'header value'
 * @param {json} body Body of the call if the method is POST
 * @param {int} retries Number of times to retry to make the REST call if there is any network problem
 * @param {function} callback (error, response) Callback function to call once the REST call is done
 */
Caller.prototype.doCall = function(url, method, headers, body, retries, callback) {
    if (!this.initialized) {
        callback(new restError(102, 'RestCaller is not initialized'));
        return;
    }
    var self = this;
    if (method == 'POST') {
        this.agent.post(url).timeout(this.options.timeout).send(body).set(headers).end(function(error, response) {
            if (error) {
                //console.log(error);
                if (error.timeout || error.code == 'ENOTFOUND' || error.code == 'ECONNREFUSED' || error.code == 'EHOSTUNREACH') {
                    if (retries > 0) {
                        self.doCall(url, method, headers, body, retries-1, callback);
                    } else {
                        callback(new restError(101, 'Maximum number of retries reached: ' + error.code));
                    }
                } else {
                    callback(error, response);
                }
            } else {
                callback(error, response);
            }
        });
    } else if (method == 'GET') {
        this.agent.get(url).timeout(this.options.timeout).set(headers).end(function(error, response) {
            if (error) {
                //console.log(error);
                if (error.timeout || error.code == 'ENOTFOUND' || error.code == 'ECONNREFUSED' || error.code == 'EHOSTUNREACH') {
                    if (retries > 0) {
                        self.doCall(url, method, headers, body, retries-1, callback);
                    } else {
                        callback(new restError(101, 'Maximum number of retries reached: ' + error.code));
                    }
                } else {
                    callback(error, response);
                }
            } else {
                callback(error, response);
            }
        });
    } else {
        callback(new restError(100, 'Unsupported method'));
    }
}

var caller = module.exports = exports = new Caller; 