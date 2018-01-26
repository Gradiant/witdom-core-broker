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
var BrokerError = require('./brokerError');
var validator = require('./tokenValidator');

function authHandler(request, response, next) {
    if (request.url.startsWith('/docs') || request.url.startsWith('/api-docs')) { //Admit access to swagger docs without client certificate
        next();
        return;
    }
    if (request.client.authorized) {
        if (request.client.encrypted) {
            var cert = request.connection.getPeerCertificate();
            if (cert) {
                if (cert.subject.CN === __brokerConfig.po_cn) {
                    request.swagger.params['skip_po'] = {
                        value: 'true'
                    };
                }
            }
        }
        next();
        return;
    } else {
        if (request.swagger.params['X-Auth-Token'] != undefined) { // Means the request admits user/token authentication
            //console.log("The method admits user/token");
            validator.validateToken(request.swagger.params['X-Auth-Token'].value, function() {
                next();
            }, next, new BrokerError('INVALID_CERTIFICATE_OR_TOKEN'));
            return;
        } else {
            //console.log("The method only admits certificate");
            throw new BrokerError('INVALID_CERTIFICATE');
        }
    }
}

module.exports = authHandler;