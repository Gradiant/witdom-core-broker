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

/**
 * This module is only for testing and developing, it basically
 * allows any http (without ssl) to pass as if it has a valid certificate
 **/
function httpAuthValidator(request, response, next) {

    if (!request.client.encrypted) request.client.authorized = true;
/*    else {
        var cert = request.connection.getPeerCertificate();
        if (cert.subject) {
            request.client.hasCert = true;
        } else {
            request.client.hasCert = false;
        }
    }*/
    next();
}

module.exports = httpAuthValidator;