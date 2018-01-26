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
global.__base = __dirname + '/../../../';
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
var should = require('should');


var ServiceInfo = require(__base + 'service_info/mockServiceInfo');

describe("Service Info: find", function() {
    it("Find service (found from local domain): ", function(done) {
        ServiceInfo.find("po", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("po");
            done();
        });
    });

    it("Find service (found from outside domain): ", function(done) {
        ServiceInfo.find("ud_service", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("ud_service");
            done();
        });
    });

    it("Find service (not found): ", function(done) {
        ServiceInfo.find("service21", function(error, service) {
            should.exist(error);
            should.not.exist(service);
            error.code.should.equal(404);
            error.message.should.equal("Service not found");
            done();
        });
    });
});

describe("Service Info: updateService: ", function() {
    it("Request ServiceInfo to update a service from orchestrator: ", function(done) {
        ServiceInfo.updateService("storage", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.location.should.equal('local');
            service.details.service_id.should.equal("storage");
            done();
        });
    });

});

describe("Service Info: findWithLocation: ", function() {
    it("Find service (local): ", function(done) {
        ServiceInfo.findWithLocation("storage", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.location.should.equal('local');
            service.details.service_id.should.equal("storage");
            done();
        });
    });

    it("Find service (outside domain): ", function(done) {
        ServiceInfo.findWithLocation("ud_service", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.location.should.equal('broker_ud');
            service.details.service_id.should.equal("ud_service");
            done();
        });
    });
});

describe("Service Info: domainList: ", function() {
    it("Domain list: ", function(done) {
        ServiceInfo.domainList(function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.should.be.array;
            services.should.deepEqual([
                {
                    service_id: "po",
                    description: "PO component",
                    uri: "192.168.0.10:8000",
                    image: "image"
                },
                {
                    service_id: "storage",
                    description: "Storage service component",
                    uri: "192.168.0.14:3317",
                    image: "image"
                },
                {    
                    service_id: "error_service",
                    description: "Error service",
                    uri: "errordomain:80",
                    image: "image"
                }
            ]);
            done();
        });
    });
});

describe("Service Info: outsideList: ", function() {
    it("Outside list: ", function(done) {
        ServiceInfo.outsideList(function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.should.be.array;
            services.should.deepEqual([
                {
                    service_id: "ud_service",
                    description: "Service from the UD",
                    uri: "192.168.1.16:9000",
                    image: "image"
                }
            ]);
            done();
        });
    });
});

describe("Service Info: list: ", function() {
    it("List all services: ", function(done) {
        ServiceInfo.list(function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.should.be.array;
            services.should.deepEqual([
                {
                    service_id: "po",
                    description: "PO component",
                    uri: "192.168.0.10:8000",
                    image: "image"
                },
                {
                    service_id: "storage",
                    description: "Storage service component",
                    uri: "192.168.0.14:3317",
                    image: "image"
                },
                {    
                    service_id: "error_service",
                    description: "Error service",
                    uri: "errordomain:80",
                    image: "image"
                },
                {
                    service_id: "ud_service",
                    description: "Service from the UD",
                    uri: "192.168.1.16:9000",
                    image: "image"
                }
            ]);
            done();
        });
    });
});