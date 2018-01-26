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
global.__base = __dirname + "/../../../";
var should = require("should");

// database models
var Service = require('../../../models/mongo/service');
var Request = require('../../../models/mongo/request');
var mongoose = require('mongoose');
var brokerConfig = require('./config');


before(function (done) {


  function clearDB() {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {});
    }
    return done();
  }


  if (mongoose.connection.readyState === 0) {
    mongoose.connect('mongodb://' + brokerConfig.database.host + ':' + brokerConfig.database.port, function (err) {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
});


after(function (done) {

    function clearDB() {
        for (var i in mongoose.connection.collections) {
            mongoose.connection.collections[i].remove(function() {});
        }
        //return done();
    }

    clearDB()
    mongoose.disconnect();
    done();
});


describe("Services : ", function() {
    it("list all services 1", function(done) {
        Service.find({}, function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.should.be.an.array;
            done();
        });
    });
    it("new service", function(done) {
        Service.saveOrUpdate("fakeService", "local",{"image": "image_url", "host": "127.0.0.1", "port": "1234","description": "A fake service"},
        function(error, savedService) {
            should.not.exist(error);
            savedService.id.should.be.a.String;
            savedService.id.should.equal("fakeService")
            savedService.service_data.should.be.an.Object;
            savedService.service_data.image.should.equal('image_url');
            savedService.service_data.host.should.equal('127.0.0.1');
            savedService.service_data.port.should.equal('1234');
            savedService.service_data.description.should.equal('A fake service');
            done();
        });
    });

    it("update service", function(done) {
        Service.findById("fakeService", function(error, savedService) {
            should.not.exist(error);
            should.exist(savedService);
            var new_service_data = savedService.service_data;
            new_service_data.host = '127.0.0.2';
            savedService.update("local", new_service_data, function(error) {
                should.not.exist(error);
                Service.findById("fakeService", function(error, savedService) {
                    should.not.exist(error);
                    should.exist(savedService);
                    savedService.id.should.be.a.String;
                    savedService.id.should.equal("fakeService")
                    savedService.service_data.should.be.an.Object;
                    savedService.service_data.host.should.equal('127.0.0.2');
                    done();
                });
            });
        });
    });

    it("list all services 2", function(done) {
        Service.find({}, function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.should.be.an.array;
            done();
        });
    });

    it("list outside services", function(done) {
        Service.find({source: {$ne:'local'}}, function(error, services) {
            should.not.exist(error);
            should.exist(services);
            services.should.be.an.array;
            services.length.should.equal(0);
            done();
        });
    });

    it("delete service", function(done) {
        Service.findById("fakeService", function(error, savedService) {
            should.not.exist(error);
            should.exist(savedService);
            savedService.remove(function(error) {
                should.not.exist(error);
                Service.findById("fakeService", function(error, savedService) {
                    should.not.exist(error);
                    should.not.exist(savedService);
                    done();
                });
            });
        });
    });
});

describe("Requests : ", function() {

    var request_id = "";

    it("new request", function(done) {
        var request = new Request({
            //user_id: "fakeUser",
            origin: 'local',
            status: "IN_PROGRESS",
            request_log: [{
                request:{
                    name:"first request"}
                }]
            });
        request.save(function(error, savedRequest) {
            should.not.exist(error);
            savedRequest.id.should.be.a.String;
            //savedRequest.user_id.should.be.a.String;
            //savedRequest.user_id.should.equal("fakeUser")
            savedRequest.status.should.be.a.String;
            savedRequest.status.should.equal("IN_PROGRESS")
            savedRequest.request_log.should.be.an.Array;
            savedRequest.request_log[0].request.name.should.equal("first request");
            request_id = savedRequest.id;
            done();
        });
    });

    it("update status", function(done) {
        Request.findById(request_id, function(error, savedRequest) {
            should.not.exist(error);
            should.exist(savedRequest);
            savedRequest.updateStatus("COMPLETED", function(error) {
                should.not.exist(error);
                Request.findById(request_id, function(error, savedRequest) {
                    should.not.exist(error);
                    savedRequest.status.should.be.a.String;
                    savedRequest.status.should.equal("COMPLETED")
                    done();
                });
            });
        });
    });

    it("update log", function(done) {
        Request.findById(request_id, function(error, savedRequest) {
            should.not.exist(error);
            should.exist(savedRequest);
            var log = savedRequest.request_log;
            log.push({
                response:{
                    name:"last response"
                }
            });
            savedRequest.updateLog(log, function(error) {
                should.not.exist(error);
                Request.findById(request_id, function(error, savedRequest) {
                    should.not.exist(error);
                    savedRequest.request_log[1].response.name.should.equal("last response");
                    done();
                });
            });
        });
    });
});