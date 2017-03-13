var should = require("should");
global.__base =  __dirname + '/../../../'; //Save the broker base directory
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
var mongoose = require('mongoose');
var winston = require('winston');
global.__logger = new winston.Logger({
    level: 'info',
    //level: 'silly',
    transports: [
    //  new (winston.transports.Console)()
    ]
});

var RequestHandler = require(__base + 'request_forwarding/requests');



var requestId = '';

describe("RequestHandler tests: ", function() {
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
        }

        clearDB();
        mongoose.disconnect();
        done();
    });

    it("Create local request", function(done) {
        RequestHandler.createRequest('local', {
            request: {
                service_name: 'fakeservice',
                service_path: 'fakeuri',
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: {}
            }
        }, function(error, request) {
            should.not.exist(error);
            should.exist(request);
            request.status.should.equal('IN_PROGRESS');
            requestId = request._id;
            done();
        });
    });
    
    it("Get existing request", function(done) {
        RequestHandler.getRequest(requestId, function(error, request) {
            should.not.exist(error);
            should.exist(request);
            request.origin.should.equal('local');
            done();
        });
    });

    it("Update existing request", function(done) {
        RequestHandler.updateRequest(requestId, 'PROTECTING', {
            response:{
                service_name: 'fakeservice',
                service_path: 'fakeuri',
                status: 200,
                headers: {},
                body: {}
            }
        }, function(error, request) {
            should.not.exist(error);
            should.exist(request);
            request.origin.should.equal('local');
            done(); 
        });
    });

    it("Delete existing request", function(done) {
        RequestHandler.deleteRequest(requestId, function(error, result) {
            should.not.exist(error);
            should.exist(result);
            result.result.ok.should.equal(1);
            result.result.n.should.equal(1);
            done();
        });
    });

    it("Get non-existing request", function(done) {
        RequestHandler.getRequest(requestId, function(error, request) {
            should.not.exist(error);
            should.not.exist(request);
            done();
        });
    });

    it("Get request wrong ID", function(done) {
        RequestHandler.getRequest("1", function(error, request) {
            should.exist(error);
            should.not.exist(request);
            done();
        });
    });

    it("Update non-existing request", function(done) {
        RequestHandler.updateRequest(requestId, 'PROTECTING', {
            response:{
                service_name: 'fakeservice',
                service_path: 'fakeuri',
                status: 200,
                headers: {},
                body: {}
            }
        }, function(error, request) {
            should.not.exist(error);
            should.not.exist(request);
            done(); 
        });
    });

    it("Update request wrong ID", function(done) {
        RequestHandler.updateRequest("1", 'PROTECTING', {
            response:{
                service_name: 'fakeservice',
                service_path: 'fakeuri',
                status: 200,
                headers: {},
                body: {}
            }
        }, function(error, request) {
            should.exist(error);
            should.not.exist(request);
            done(); 
        });
    });

    it("Delete non-existing request", function(done) {
        RequestHandler.deleteRequest(requestId, function(error, result) {
            should.not.exist(error);
            should.exist(result);
            result.result.ok.should.equal(1);
            result.result.n.should.equal(0);
            done();
        });
    });

    it("Delete request wrong ID", function(done) {
        RequestHandler.deleteRequest("1", function(error, result) {
            should.exist(error);
            should.not.exist(result);
            done();
        });
    });
    

    
});