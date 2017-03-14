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
var nock = require('nock');
var restCaller = require(__base + 'request/rest').Rest;

restCaller.init({timeout: 1000});

var RestHandler = require(__base + 'request_forwarding/rest');
var orchestration = require(__brokerConfig.orchestrator.name);

before(function (done) {

    orchestration.Orchestrator.connect(__brokerConfig.orchestrator.config, function (error) {
        should.not.exist(error);
        done();
    });
});

describe("RestHandler: ", function() {
    describe("request: ", function() {
        describe("Success: ", function() {
            it("GET google: ", function(done) {
                RestHandler.request({
                    details: {
                        service_id: "google_http",
                        description: "Google search",
                        uri: "www.google.com:80",
                        image: "image"
                    }
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
                },"fakeid", function(error, response) {
                    //console.log(response.status);
                    should.not.exist(error);
                    should.exist(response);
                    response.status.should.equal(200);
                    done();
                });

            });

            it("GET google logo: ", function(done) {
                RestHandler.request({
                    details: {
                        service_id: "google_http",
                        description: "Google search",
                        uri: "www.google.com:80",
                        image: "image"
                    }
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
                }, "fakeid", function(error, response) {
                    should.not.exist(error);
                    should.exist(response);
                    response.status.should.equal(200);
                    done();
                });
            });
        });
        
        describe("Error, wrong data or method: ", function() {
            it("POST wrong JSON: ", function(done) {
                RestHandler.request({
                    details: {
                        service_id: "google_http",
                        description: "Google search",
                        uri: "www.google.com:80",
                        image: "image"
                    }
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
                }, "fakeid", function(error, response) {
                    should.not.exist(error);
                    should.exist(response);
                    response.status.should.equal(405);
                    //response.status.should.equal(200);
                    done();
                });

            });

            it("Request with unsupported method", function(done) {
                RestHandler.request({
                    details: {
                        service_id: "error_service",
                        description: "Error service",
                        uri: "errordomain.com:80",
                        image: "image"
                    }
                },{
                    request: {
                        service_name: 'error_service',
                        service_path: '/',
                        method: 'PUT',
                        headers: {
                            "content-type": "application/json",
                            "accept": "application/json"
                        },
                        body: "ABC"
                    }
                },"fakeid", function(error, response) {
                    should.exist(error);
                    should.not.exist(response);
                    error.code.should.equal(400);
                    error.message.should.equal('unsuported method');
                    done();
                });
            });
        });



        describe("Error in response: ", function() {
            before(function(done) {
                nock('http://errordomain:80')
                .post('/')
                .replyWithError("Error in the HTTP request");
                done();
            });

            it("POST request with error response", function(done) {
                
                RestHandler.request({
                    details: {
                        service_id: "error_service",
                        description: "Error service",
                        uri: "errordomain.com:80",
                        image: "image"
                    }
                },{
                    request: {
                        service_name: 'error_service',
                        service_path: '/',
                        method: 'POST',
                        headers: {
                            "content-type": "application/json",
                            "accept": "application/json"
                        },
                        body: "ABC"
                    }
                },"fakeid", function(error, response) {
                    should.exist(error);
                    should.not.exist(response);
                    error.code.should.equal(503);
                    error.message.should.equal('cannot reach service');
                    done();
                });
            });
        });


        describe("Not responding + unexisting service: ", function() {
            before(function(done) {
                nock('http://notresponding:80')
                .get('/').times(2)
                .delayConnection(5000)
                .reply(200,"My reply");
                //done();

                nock('http://broker-ud:5100')
                .get('/v1/service/domainlist')
                .reply(200, JSON.stringify([]), {'Content-type': 'application/json'});
                done();
            });


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

            it("GET to unresponsive service and service doesn't exist in orchestrator", function(done) {
                RestHandler.request({
                    details: {
                        service_id: "unexisting_service",
                        description: "Unexisting service",
                        uri: "notresponding:80",
                        image: "image"
                    }
                },{
                    request: {
                        service_name: 'unexisting_service',
                        service_path: '/',
                        method: 'GET',
                        headers: {
                        }
                    }
                },"fakeid", function(error, response) {
                    should.exist(error);
                    should.not.exist(response);
                    error.code.should.equal(404);
                    error.message.should.equal('Service not found');
                    done();
                });
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
        });

    });

    describe("forwardRequest: ", function() {

        before(function(done) {
            nock(__brokerConfig.protocol + '://' + __brokerConfig['broker_ed'].domain_name + ':' + __brokerConfig['broker_ed'][__brokerConfig.protocol].port)
            .post('/v1/forward/domain')
            .reply(202,'12345',{'Content-type': 'text/plain'});

            done();
        });

        it("Forward request to external service", function(done) {
            RestHandler.forwardRequest(__brokerConfig['broker_ed'],
                {
                    request: {
                        service_path: 'fakepath',
                        service_name: 'fakeservice',
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: {}
                    }
                }, 'fakeid', function(error, response) {
                    should.not.exist(error);
                    should.exist(response);
                    response.status.should.equal(202);
                    response.body.should.equal('12345');

                    done();
                }
            );
        });

    });


    describe('forwardCallback: ', function() {
        before(function(done) {
            nock(__brokerConfig.protocol + '://' + __brokerConfig['broker_ed'].domain_name + ':' + __brokerConfig['broker_ed'][__brokerConfig.protocol].port)
            .post('/v1/forward/callback')
            .reply(200)
            .post('/v1/forward/callback')
            .reply(404,
                {
                    message: [{
                        code:"404",
                        message:"Cast to ObjectId failed for value \"string\" at path \"_id\"",
                        path:['/v1/forward/callback']
                    }]
                }, {'Content-Type': 'application/json'})
            .post('/v1/forward/callback')
            .reply(404,
                {
                    message: [{
                        code:"404",
                        message: 'Can not find request',
                        path:['/v1/forward/callback']
                    }]
                }, {'Content-Type': 'application/json'});

            done();
        });

        it('Forward callback to the origin domain', function(done) {
            RestHandler.forwardCallback(__brokerConfig['broker_ed'],
                {
                    response: {
                        service_name: 'fakeservice',
                        service_path: 'fakepath',
                        status: 200,
                        headers: {'Content-Type': 'text/plain'},
                        body: 'service result'
                    }
                },
                "fakeid",
                function(error, response) {
                    should.not.exist(error);
                    should.exist(response);
                    response.status.should.equal(200);

                    done();
                }
            );

        });

        it('Forward callback to the origin domain (wrong id)', function(done) {
            RestHandler.forwardCallback(__brokerConfig['broker_ed'],
                {
                    response: {
                        service_name: 'fakeservice',
                        service_path: 'fakepath',
                        status: 200,
                        headers: {'Content-Type': 'text/plain'},
                        body: 'service result'
                    }
                },
                "wrong_id", // Simulate a wrong id
                function(error, response) {
                    should.not.exist(error);
                    should.exist(response);
                    response.status.should.equal(404);
                    response.body.should.deepEqual({
                        message: [{
                            code:"404",
                            message:"Cast to ObjectId failed for value \"string\" at path \"_id\"",
                            path:['/v1/forward/callback']
                        }]
                    });

                    done();
                }
            );
        });

        it('Forward callback to the origin domain (original request doesn\'t exist)', function(done) {
            RestHandler.forwardCallback(__brokerConfig['broker_ed'],
                {
                    response: {
                        service_name: 'fakeservice',
                        service_path: 'fakepath',
                        status: 200,
                        headers: {'Content-Type': 'text/plain'},
                        body: 'service result'
                    }
                },
                "unexisting_id", // Simulate a wrong id
                function(error, response) {
                    should.not.exist(error);
                    should.exist(response);
                    response.status.should.equal(404);
                    response.body.should.deepEqual({
                        message: [{
                            code:"404",
                            message:"Can not find request",
                            path:['/v1/forward/callback']
                        }]
                    });

                    done();
                }
            );
        });
    });
});