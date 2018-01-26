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
var should = require("should");

var orchestration = require('../index');

var config = {
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
};

var orchestrator = orchestration.Orchestrator;

before(function(done) {
    orchestrator.connect(config, function (error) {
        should.not.exist(error);
        done();
    });
});

describe("Services : ", function() {
    it("get service data", function(done) {
        orchestrator.getServiceData('google_http', function(error, service_data) {
            should.not.exist(error);
            should.exist(service_data);
            service_data.image.should.equal("image_url");
            service_data.host.should.equal(config.services.google_http.host);
            service_data.port.should.equal(config.services.google_http.port);
            service_data.description.should.equal("service_description");
            done();
        });
    });

    it("get unknown service data", function(done) {
        orchestrator.getServiceData('unknown', function(error, service_data) {
            should.exist(error);
            should.not.exist(service_data);
            done();
        });
    });

    it("update service", function(done) {
        orchestrator.getServiceList(function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.length.should.equal(2);
            for(i=1; i<=services.lenght; i++) {
                if(services[i].name == "google_http"){
                    services[i].image.should.equal("image_url");
                    service_data.host.should.equal(config.services.google_http.host);
                    service_data.port.should.equal(config.services.google_http.port);
                    service_data.description.should.equal("service_description");
                } else if(services[i].name == "google_https") {
                    services[i].image.should.equal("image_url");
                    service_data.host.should.equal(config.services.google_https.host);
                    service_data.port.should.equal(config.services.google_https.port);
                    service_data.description.should.equal("service_description");
                }
            }
            done();
        });
    });
});