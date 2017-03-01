var should = require("should");
global.__base =  __dirname + '/../../../'; //Save the broker base directory
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
var winston = require('winston');
global.__logger = new winston.Logger({
    level: 'info',
    transports: [
//      new (winston.transports.Console)()
    ]
});
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

  /*  var orchestratorConfig = {
                service_name: 'google',
                service_host: 'www.google.com',
                service_port: '443'
            };*/
    orchestrator.connect(brokerConfig.orchestrator.config, function(error) {
        if(error) throw error;
        var forwarderConfig = {
            certificate_key: __dirname + '/../../../CAs/tdCA/client_td_key.pem',
            certificate: __dirname + '/../../../CAs/tdCA/client_td_crt.pem',
            ca: __dirname + '/../../../CAs/tdCA/tdcacert.pem'
        }
        requestForwardingHandler.initialize(forwarderConfig, function(error) {
            if(error) throw error;
            if(mongoose.connection.readyState === 0) {
                mongoose.connect('mongodb://' + brokerConfig.database.host + ':' + brokerConfig.database.port   , function (err) {
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
    it("GET google: ok", function(done) {
        var service_name = 'google_http';
        var service_path = '/';
        var method = 'GET';
        var headers = {
            "accept": "application/json"
        };
        var body = null

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
            }, 1000)
        });
    });

    it("POST google: bad id", function(done) {
        var service_name = 'google_http';
        var service_path = '/';
        var method = 'POST';
        var headers = {
            "content-type": "application/json",
            "accept": "application/json"
        };
        var body = {};

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
            }, 1000)
        });
    });

    it("POST google: bad body", function(done) {
        var service_name = 'google_http';
        var service_path = '/';
        var method = 'POST';
        var headers = {};   // No content-type header
        var body = {};

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
            }, 1000)
        });
    });
});

describe("Rest call tests (doRestCall): ", function() {
    it("GET google: ", function(done) {
        requestForwardingHandler.doRestCall({
            service_id: "google_http",
            description: "Google search",
            uri: "www.google.com:80",
            image: "image"
        },{
            request: {
                service_name: 'google_http',
                service_path: '/',
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                body: null
            }
        }, function(response) {
            //console.log(response.status);
            should.exist(response);
            response.status.should.equal(200);
            done();
        });

    });

    it("GET google logo: ", function(done) {
        requestForwardingHandler.doRestCall({
            service_id: "google_http",
            description: "Google search",
            uri: "www.google.com:80",
            image: "image"
        },{
            request: {
                service_name: 'google_http',
                service_path: '/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                method: 'GET',
                headers: {
                    //"accept": "application/json"
                },
                body: null
            }
        }, function(response) {
            //console.log(response.status);
            //console.log(response.headers);
            //console.log(response.body.length);
            should.exist(response);
            response.status.should.equal(200);
            done();
        });
    });
});

describe("Rest call tests (doRestCall2): ", function() {
    it("GET google: ", function(done) {
        requestForwardingHandler.doRestCall2({
            service_id: "google_http",
            description: "Google search",
            uri: "www.google.com:80",
            image: "image"
        },{
            request: {
                service_name: 'google_http',
                service_path: '/',
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                body: null
            }
        }, function(error, response) {
            should.not.exist(error);
            //console.log(response.status);
            should.exist(response);
            response.status.should.equal(200);
            done();
        });

    });

    it("GET google logo: ", function(done) {
        requestForwardingHandler.doRestCall2({
            service_id: "google_http",
            description: "Google search",
            uri: "www.google.com:80",
            image: "image"
        },{
            request: {
                service_name: 'google_http',
                service_path: '/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
                method: 'GET',
                headers: {
                    //"accept": "application/json"
                },
                body: null
            }
        }, function(error, response) {
            should.not.exist(error);
            //console.log(response.status);
            //console.log(response.headers);
            //console.log(response.body.length);
            should.exist(response);
            response.status.should.equal(200);
            done();
        });

    });

    it("POST wrong JSON: ", function(done) {
        requestForwardingHandler.doRestCall2({
            service_id: "google_http",
            description: "Google search",
            uri: "www.google.com:80",
            image: "image"
        },{
            request: {
                service_name: 'google_http',
                service_path: '/',
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                body: "ABC"
            }
        }, function(error, response) {
            should.exist(error);
            //console.log(response.status);
            //console.log(response.headers);
            //console.log(response.text);
            should.exist(response);
            //response.status.should.equal(200);
            done();
        });

    });

    /*it("POST wrong JSON: ", function(done) {
        requestForwardingHandler.doRestCall2({
            service_id: "po",
            description: "po",
            uri: "10.5.1.120:8080",
            image: "image"
        },{
            request: {
                service_name: 'google_http',
                service_path: '/v1/execute/dasgs/protect',
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json",
                    "X-Auth-Token": "dsgasdgsa"
                },
                body: {
                    "callbackUrl": "/request/callback?request_id=2",
                    "serviceCallParameters": {}
                } 
            }
        }, function(error, response) {
            should.not.exist(error);
            //console.log(response.status);
            //console.log(response.headers);
            //console.log(response.text);
            should.exist(response);
            //response.status.should.equal(200);
            done();
        });

    });*/
});