global.__base = __dirname + '/../../../'; //Save the broker base directory
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
var should = require('should');
var mongoose = require('mongoose');

var ServiceInfo = require(__base + 'service_info/ServiceInfo');
var nock = require("nock");
var url_prefix = __brokerConfig.protocol + "://" + __brokerConfig.broker_ed.domain_name + ":" + __brokerConfig.broker_ed[__brokerConfig.protocol].port +"/v1";
try {
    var orchestration = require(__brokerConfig.orchestrator.name);
} catch(error) {
    throw 'Can not load orchestator module: ' + error;
}

before(function (done) {

    orchestration.Orchestrator.connect(__brokerConfig.orchestrator.config, function (error) {
        should.not.exist(error);
    });

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

beforeEach(function(done){
    nock(url_prefix).get('/service/domainlist')
    .reply(200,[
        {
            "service_id": "ud_service",
            "description": "service from the untrusted domain",
            "uri": "192.168.1.10:8000",
            "image": "ud_service_image" 
        },
        {
            "service_id": "ud_storage",
            "description": "storage from the untrusted domain",
            "uri": "192.168.1.12:3317",
            "image": "ud_storage_image" 
        },
        {
            "service_id": "ud_pc",
            "description": "PC from the untrusted domain",
            "uri": "192.168.1.15:6000",
            "image": "ud_pc_image" 
        }
    ]);
    done();
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

describe("Service Info: find", function() {
    it("Find service (found from local domain in orchestrator): ", function(done) {
        ServiceInfo.find("google_http", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("google_http");
            done();
        });
    });

    it("Find service (found from outside domain): ", function(done) {
        ServiceInfo.find("ud_storage", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("ud_storage");
            done();
        });
    });

    it("Find service (found from local domain in orchestrator): ", function(done) {
        ServiceInfo.find("google_https", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("google_https");
            done();
        });
    });

    it("Find service (found from outside domain in database): ", function(done) {
        ServiceInfo.find("ud_pc", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("ud_pc");
            done();
        });
    });

    it("Find service (found from local domain in databse): ", function(done) {
        ServiceInfo.find("google_https", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.service_id.should.equal("google_https");
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

describe("Service Info: findWithLocation: ", function() {
    it("Find service (local): ", function(done) {
        ServiceInfo.findWithLocation("google_http", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.location.should.equal('local');
            service.details.service_id.should.equal("google_http");
            done();
        });
    });

    it("Find service (outside domain): ", function(done) {
        ServiceInfo.findWithLocation("ud_service", function(error, service) {
            should.not.exist(error);
            should.exist(service);
            service.location.should.equal( __brokerConfig.broker_ed.domain_name);
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
                    "service_id": "google_http",
                    "description": "service_description",
                    "uri": "www.google.com:443",
                    "image": "image_url"
                },
                {
                    "service_id": "google_https",
                    "description": "service_description",
                    "uri": "www.google.com:80",
                    "image": "image_url",
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
                    "service_id": "ud_service",
                    "description": "service from the untrusted domain",
                    "uri": "192.168.1.10:8000",
                    "image": "ud_service_image" 
                },
                {
                    "service_id": "ud_storage",
                    "description": "storage from the untrusted domain",
                    "uri": "192.168.1.12:3317",
                    "image": "ud_storage_image" 
                },
                {
                    "service_id": "ud_pc",
                    "description": "PC from the untrusted domain",
                    "uri": "192.168.1.15:6000",
                    "image": "ud_pc_image" 
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
                    "service_id": "google_http",
                    "description": "service_description",
                    "uri": "www.google.com:443",
                    "image": "image_url"
                },
                {
                    "service_id": "google_https",
                    "description": "service_description",
                    "uri": "www.google.com:80",
                    "image": "image_url",
                },
                {
                    "service_id": "ud_service",
                    "description": "service from the untrusted domain",
                    "uri": "192.168.1.10:8000",
                    "image": "ud_service_image" 
                },
                {
                    "service_id": "ud_storage",
                    "description": "storage from the untrusted domain",
                    "uri": "192.168.1.12:3317",
                    "image": "ud_storage_image" 
                },
                {
                    "service_id": "ud_pc",
                    "description": "PC from the untrusted domain",
                    "uri": "192.168.1.15:6000",
                    "image": "ud_pc_image" 
                }
            ]);
            done();
        });
    });
});