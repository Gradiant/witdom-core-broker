var should = require("should");

// ForwardingHandler
var requestForwardingHandler = require('../../../request_forwarding/requestForwardingHandler');

// Orchestrator
var orchestrator = require('mock_example').Orchestrator;

// Mongo
var mongoose = require('mongoose');

var fs = require('fs');

before(function (done) {

    function clearDB() {
        for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
        }
        return done();
    }

    var orchestratorConfig = {
                service_name: 'broker',
                service_host: '192.168.122.221',
                service_port: '5043'
            };
    orchestrator.connect(orchestratorConfig, function(error) {
        if(error) throw error;
        var forwarderConfig = {
            certificate_key: __dirname + '/../../../CAs/witdomCA/client1_key.pem',
            certificate: __dirname + '/../../../CAs/witdomCA/client1_crt.pem',
            ca: __dirname + '/../../../CAs/witdomCA/witdomcacert.pem'
        }
        requestForwardingHandler.initialize(forwarderConfig, function(error) {
            if(error) throw error;
            if(mongoose.connection.readyState === 0) {
                mongoose.connect('mongodb://192.168.122.221:27017', function (err) {
                    if (err) {
                        throw err;
                    }
                    return clearDB();
                });
            } else {
                return clearDB();
            }
        });
    });
});

after(function (done) {

    function clearDB() {
        for (var i in mongoose.connection.collections) {
            mongoose.connection.collections[i].remove(function() {});
        }
    }

    clearDB()
    mongoose.disconnect();
    return done();
});

describe("Requests : ", function() {
    it("POST broker: ok", function(done) {
        var service_name = 'broker';
        var service_path = '/v1/request/create';
        var method = 'POST';
        var headers = {
            "content-type": "application/json"
        };
        var body = {
            "service_name": "string",
            "request_type": "string",
            "request_uri": "string",
            "request_data": {}
        };

        // Create request
        requestForwardingHandler.createRequest({
            request: {
                service_name: service_name,
                service_path: service_path,
                method: method,
                headers: headers,
                body: body
            }
        }, function(error, request_id) {
            should.not.exist(error);
            should.exist(request_id);
            request_id.should.be.a.string;
            setTimeout(function () {
                requestForwardingHandler.getRequest(request_id, function(error, request) {
                    should.not.exist(error);
                    request.status.should.equal('FINISHED');
                    var log_size = request.request_log.length;
                    var last = request.request_log[log_size - 1];
                    should.exist(last.response);
                    last.response.status.should.equal(200);
                    done();
                });
            }, 5000)
        });
    });

    it("POST broker: bad id", function(done) {
        var service_name = 'broker';
        var service_path = '/v1/request/create';
        var method = 'POST';
        var headers = {
            "content-type": "application/json"
        };
        var body = {
            "service_name": "string",
            "request_type": "string",
            "request_uri": "string",
            "request_data": {}
        };

        // Create request
        requestForwardingHandler.createRequest({
            request: {
                service_name: service_name,
                service_path: service_path,
                method: method,
                headers: headers,
                body: body
            }
        }, function(error, request_id) {
            should.not.exist(error);
            should.exist(request_id);
            request_id.should.be.a.string;
            setTimeout(function () {
                requestForwardingHandler.getRequest(request_id + 'jkdf', function(error, request) {
                    should.exist(error);
                    done();
                });
            }, 5000)
        });
    });

    it("POST broker: bad body", function(done) {
        var service_name = 'broker';
        var service_path = '/v1/request/create';
        var method = 'POST';
        var headers = {
            "content-type": "application/json"
        };
        var body = fs.readFileSync(__dirname + '/../../../CAs/witdomCA/client1_key.pem');

        // Create request
        requestForwardingHandler.createRequest({
            request: {
                service_name: service_name,
                service_path: service_path,
                method: method,
                headers: headers,
                body: body
            }
        }, function(error, request_id) {
            should.not.exist(error);
            should.exist(request_id);
            request_id.should.be.a.string;
            setTimeout(function () {
                requestForwardingHandler.getRequest(request_id, function(error, request) {
                    should.not.exist(error);
                    request.status.should.equal('FINISHED');
                    var log_size = request.request_log.length;
                    var last = request.request_log[log_size - 1];
                    should.exist(last.response);
                    last.response.status.should.equal(400);
                    done();
                });
            }, 5000)
        });
    });
});