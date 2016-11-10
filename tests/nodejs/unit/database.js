var should = require("should");

// database models
var Service = require('../../../models/mongo/service')
var Request = require('../../../models/mongo/request')
var mongoose = require('mongoose');


before(function (done) {


  function clearDB() {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {});
    }
    return done();
  }


  if (mongoose.connection.readyState === 0) {
    mongoose.connect('mongodb://mongo:27017', function (err) {
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
        return done();
    }

    clearDB()
    mongoose.disconnect();
    return done();
});


describe("Services : ", function() {
    it("new service", function(done) {
        Service.saveOrUpdate("fakeService", {'host': '127.0.0.1'}, function(error, savedService) {
            should.not.exist(error);
            savedService.id.should.be.a.String;
            savedService.id.should.equal("fakeService")
            savedService.host_data.should.be.an.Object;
            savedService.host_data.host.should.equal('127.0.0.1');
            done();
        });
    });

    it("update service", function(done) {
        Service.findById("fakeService", function(error, savedService) {
            should.not.exist(error);
            should.exist(savedService);
            savedService.update( {'host': '127.0.0.2'}, function(error) {
                should.not.exist(error);
                Service.findById("fakeService", function(error, savedService) {
                    should.not.exist(error);
                    should.exist(savedService);
                    savedService.id.should.be.a.String;
                    savedService.id.should.equal("fakeService")
                    savedService.host_data.should.be.an.Object;
                    savedService.host_data.host.should.equal('127.0.0.2');
                    done();
                });
            });
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
            user_id: "fakeUser",
            status: "IN_PROGRESS",
            requests_log: [{
                request:{
                    name:"first request"}
                }]
            });
        request.save(function(error, savedRequest) {
            should.not.exist(error);
            savedRequest.id.should.be.a.String;
            savedRequest.user_id.should.be.a.String;
            savedRequest.user_id.should.equal("fakeUser")
            savedRequest.status.should.be.a.String;
            savedRequest.status.should.equal("IN_PROGRESS")
            savedRequest.requests_log.should.be.an.Array;
            savedRequest.requests_log[0].request.name.should.equal("first request");
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
            var log = savedRequest.requests_log;
            log.push({
                response:{
                    name:"last response"
                }
            });
            savedRequest.updateLog(log, function(error) {
                should.not.exist(error);
                Request.findById(request_id, function(error, savedRequest) {
                    should.not.exist(error);
                    savedRequest.requests_log[1].response.name.should.equal("last response");
                    done();
                });
            });
        });
    });
});