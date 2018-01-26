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
module.exports = {
    http: {
        host: "localhost", 
        port: 5000
     },
    https: {
        host: "broker-td",
        port: 5043,
        right_client_key: 'CAs/tdCA/client_td_key.pem',
        right_client_cert: 'CAs/tdCA/client_td_crt.pem',
        wrong_client_key: 'CAs/untrustedCA/untrusted_client_key.pem',
        wrong_client_cert: 'CAs/untrustedCA/untrusted_client_crt.pem',
        ca_cert: 'CAs/tdCA/tdcacert.pem'
    }
};