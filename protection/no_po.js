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


/**
 * This module serves as a dummy substitute for the PO connector. It just returns the data passed in serviceCallParameters
 */
function Connector() {

}

Connector.prototype.connect = function(config ,callback) {
    __logger.silly("no_po: connect");
    callback(null);
}

Connector.prototype.protect = function(callbackUrl, service_info, request_headers, serviceCallParameters, callback) {
    __logger.silly("no_po: protect");
    callback(null, null, serviceCallParameters || {});
}

Connector.prototype.unprotect = function(callbackUrl, service_info, request_headers, serviceCallParameters, callback) {
    __logger.silly("no_po: unprotect");
    callback(null, null, serviceCallParameters || {});
}

//var Connector = module.exports = exports = new Connector;
var connector = new Connector;

module.exports = {
  Protector: connector
}