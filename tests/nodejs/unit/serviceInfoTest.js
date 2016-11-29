global.__base = __dirname + '/../../../'; //Save the broker base directory
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
var should = require('should');
var mongoose = require('mongoose');

var ServiceInfo = require(__base + 'service_info/ServiceInfo');

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
    /*return */done();
});

describe("Service Info: ", function() {
    it("Find service (found): ", function(done) {
        ServiceInfo.find("service1", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("service1");
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