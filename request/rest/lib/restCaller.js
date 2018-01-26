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
        // __logger.debug("Making POST request to " + url);
        // __logger.debug("timeout: " + this.options.timeout);
        // __logger.debug("body: " + JSON.stringify(body));
        // __logger.debug("headers: " + JSON.stringify(headers, null, 2));
        this.agent.post(url).timeout(this.options.timeout).send(body).set(headers).end(function(error, response) {
            // __logger.debug("retries: " + retries);
            if (error && !error.status) {
                //console.log(error);
                if (error.timeout || error.code == 'ENOTFOUND' || error.code == 'ECONNREFUSED' || error.code == 'EHOSTUNREACH' || error.code == 'ECONNRESET' || error.code == 'EAI_AGAIN') {
                    if (retries > 0) {
                        self.doCall(url, method, headers, body, retries-1, callback);
                    } else {
                        callback(new restError(101, 'Maximum number of retries reached: ' + error.code));
                    }
                } else {
                    callback(error, response);
                }
            } else {
                if (response.type) {
                    if (response.type.indexOf('text') != -1) { // if content-type is text put the text in response.body
                        response.body = response.text;
                    }
                }
                callback(null, response);
            }
        });
    } else if (method == 'GET') {
        this.agent.get(url).timeout(this.options.timeout).set(headers).end(function(error, response) {
            //if(error) console.log(error.statusType);
            if (error && !error.status) {
                //console.log(error.statusType);
                if (error.timeout || error.code == 'ENOTFOUND' || error.code == 'ECONNREFUSED' || error.code == 'EHOSTUNREACH' || error.code == 'ECONNRESET' || error.code == 'EAI_AGAIN') {
                    if (retries > 0) {
                        self.doCall(url, method, headers, body, retries-1, callback);
                    } else {
                        callback(new restError(101, 'Maximum number of retries reached: ' + error.code));
                    }
                } else {
                    callback(error, response);
                }
            } else {
                if (response.type) {
                    if (response.type.indexOf('text') != -1) { // if content-type is text put the text in response.body
                        response.body = response.text;
                    }
                }
                callback(null, response);
            }
        });
    } else {
        callback(new restError(100, 'Unsupported method'));
    }
}

var caller = module.exports = exports = new Caller; 