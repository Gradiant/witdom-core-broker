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
var ExtendedExpressPlugin = function(options) {

    this._userId = null;
    this._options = {
        auditLog:null,          // instance of AuditLog
        whiteListPaths:[],      // array of regular expressions for allowed paths. if none supplied, all paths are allowed.
        blackListPaths:[]       // array of regular expressions for excluded paths. if none supplied, all paths are allowed.
    };

    //override default options with the provided values
    if(typeof options !== 'undefined') {
        for(var attr in options) {
            this._options[attr] = options[attr];
        }
    }

    var self = this;

    this.middleware = function(req, res, next) {
        var method = req.method,
            path = req.url;
        var origin = undefined;

        // verify the path being requested is to be logged.
        if(!self.pathAllowed(path, method)) return next();

        // Use the token as _userId
        self._userId = req.headers['X-Auth-Token'] || req.headers['x-auth-token'];
        
        
        // If the request uses HTTPS we can get the client certificate
        if (req.client.encrypted) {
            var cert = req.connection.getPeerCertificate();
            if (cert) {
                origin = JSON.stringify(cert.subject);
            }
        }

        // pass the user id back to AuditLog for usage across other internal resources.
        if(self._userId) self._options.auditLog._userId = self._userId;

        var data = undefined;
        try {
            data = JSON.stringify(req.body);
        } catch (error) {
            console.log("Error converting body to string");
            data = req.body;
        }
        var headers = undefined;
        try {
            headers = JSON.stringify(req.headers);
        } catch (error) {
            console.log("Error stringifying headers");
        }

        self._options.auditLog.logEvent(self._userId, origin, method, path, headers, data);

        return next();
    }

    /* pathAllowed( path, method )
     *
     * Check the requested path and method against the whitelist and blacklist options,
     * return boolean representing whether logging this request is allowed.
     *
     */
    this.pathAllowed = function(path, method) {
        var matched, i, x;
        
        if(self._options.whiteListPaths.length) {

            // if any whiteListPaths are set, the path must match at least one
            matched = false;

            whiteListCheck:
            for(i=0; i<self._options.whiteListPaths.length; i++) {
                var rule = self._options.whiteListPaths[i];

                if(rule instanceof RegExp) {
                    rule = {
                        regex: rule
                        // no methods supplied, all methods
                    };
                }
                
                if(path.match(rule.regex)) {
                    if(rule.methods) {
                       for(x=0; x<rule.methods.length; x++) {
                           if(method.toUpperCase() == rule.methods[x].toUpperCase()) {
                               matched = true;
                               break whiteListCheck;
                           }
                       }
                    } else {
                        matched = true;
                        break whiteListCheck;
                    }
                }
            }
            
            if(!matched) return false;
        }
        
        if(self._options.blackListPaths.length) {

            // if any blackListPaths are set, the path must NOT match any
            matched = false;

            blackListCheck:
            for(i=0; i<self._options.blackListPaths.length; i++) {
                var rule = self._options.blackListPaths[i];
                
                if(rule instanceof RegExp) {
                    rule = {
                        regex: rule
                        // no methods supplied, all methods
                    };
                }
                
                if(path.match(rule.regex)) {
                    if(rule.methods) {
                        for(x=0; x<rule.methods.length; x++) {
                            if(method.toUpperCase() == rule.methods[x].toUpperCase()) {
                                matched = true;
                                break blackListCheck;
                            }
                        }
                    } else {
                        matched = true;
                        break blackListCheck;
                    }
                }
            }
            
            if(matched) return false;
        }
        
        return true;
    }
};

exports = module.exports = ExtendedExpressPlugin;