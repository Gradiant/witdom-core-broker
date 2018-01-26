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
//var brokerConfig = require('../config');


console.log("token validator module: " + __brokerConfig.tokenValidationModule);
var auth = require(__brokerConfig.tokenValidationModule);

var BrokerError = require('./brokerError');

var authService = new auth.TokenValidationService(__brokerConfig.tokenValidationService.endpoint, __brokerConfig.tokenValidationService.admin.user, __brokerConfig.tokenValidationService.admin.pass);


module.exports.validateToken = function(token, callback, next, throwerror) {
    if (token == undefined) {
        next(throwerror);
        return;
    }
    authService.validateAuthenticationToken(token, function(error, tokenValid, tokenUser) {
        if (error) {
            //console.log("Validation service error:", error.status, error.message);
            next(new BrokerError("COULDNT_VALIDATE_TOKEN"));
        } else {
            if (tokenValid) {
                //console.log("The token is valid");
                if (typeof callback === "function") {
                    callback();
                }
            } else {
                //console.log("Token is not valid");
                next(throwerror);
            }
        }
    });
}