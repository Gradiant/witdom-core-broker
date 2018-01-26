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
    //tokenValidationModule: __base + "validators/dummyTokenValidation"
    /*orchestrator: {
        name: 'cloudify_provider_connector',
        config: {
            protocol: 'http',
            host: 'localhost',
            port: '1234'
        }
    }*/
    protocol: "http",
    database: {
        host: 'localhost',
        port: '27017'
    },
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                po: {
                    host: "10.5.1.120",
                    port: "8080"
                },
                service_td: {
                    host: "10.5.1.120",
                    port: "8081"
                }
            }
        }
    },
    tokenValidationService: {
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://10.10.43.20:5001/v3"
    }
};