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
    protocol: "https",
    http: { port: 5000 },
    https: {
        port: 5043,
        broker_key: 'certs/broker_key.pem',
        broker_key_passphrase: 'Gr4d14ntBr0k3r',
        broker_cert: 'certs/broker_td_crt.pem',
        //ca_cert: 'certs/tdcacert.pem'
        ca_certs: ['certs/tdcacert.pem', 'certs/udcacert.pem']
    },
    testing: true,
    numberOfRetries: 10,
    po_id: 'po',
    po_cn: 'po', // Common Name of the PO expected to be received in its client certificate, used to skip the calls to PO when the PO is the service making calls to the untrusted domain 
    po_connector: './protection/po_connector',
    po_basepath: '/v1',
    broker_ed : { //broker external domain
        domain_name: "broker-ud",
        http: {
            port: 5100
        },
        https: {
            port: 5143
        },
        http_port: 5100,
        https_port: 5143
    },
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://127.0.0.1:5001/v3"
    },
    tokenValidationModule: "openstack-token-utils",
    database: {
        host: 'mongo',
        port: '27017'
    },
    audit: {
        active: 'true',
        database: {
            host: 'mongo',
            port: '27017'
        }
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                google_http: {
                    host: "www.google.com",
                    port: "443"
                },
                google_https: {
                    host: "www.google.com",
                    port: "80"
                }
            }
        }
    },
    serviceInfoModule : __base + "service_info/ServiceInfo"
};