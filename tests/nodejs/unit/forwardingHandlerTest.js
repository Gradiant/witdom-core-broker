var should = require("should");
global.__base =  __dirname + '/../../../'; //Save the broker base directory
var brokerConfig = require('./config');
global.__brokerConfig = brokerConfig;
__brokerConfig.serviceInfoModule =  __base + "service_info/ServiceInfo";
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

var protection = require(__base + brokerConfig.po_connector);
var protector = protection.Protector;

var protectorConfig = {
    protocol: __brokerConfig.protocol,
    po_id: __brokerConfig.po_id,
    numberOfRetries: __brokerConfig.numberOfRetries,
    basepath: __brokerConfig.po_basepath
};

protector.connect(protectorConfig, function (error) {
    if (error) {
        console.log(error);
    }
});

var ForwardingHandler = require(__base + 'request_forwarding/forward');
var RequestHandler = require(__base + 'request_forwarding/requests');
var orchestration = require(__brokerConfig.orchestrator.name);
var requestId;

describe("ForwardingHandler tests: ", function() {

    before(function (done) {
        orchestration.Orchestrator.connect(__brokerConfig.orchestrator.config, function (error) {
            should.not.exist(error);
            //done();
        });

        nock('http://broker-ud:5100')
        .get('/v1/service/domainlist')
        .reply(200, JSON.stringify([]), {'Content-type': 'application/json'})
        .get('/v1/service/domainlist')
        .reply(200, JSON.stringify([{service_id:'external_service',description:'description',uri:'external-service:80',image:'image'}]), {'Content-type': 'application/json'})
        .post('/v1/forward/domain')
        .reply(202,'12345',{'Content-type': 'text/plain'})
        .get('/v1/service/domainlist')
        .reply(200, JSON.stringify([]), {'Content-type': 'application/json'})
        .post('/v1/forward/callback')
        .reply(200)
        .get('/v1/service/domainlist')
        .reply(200, JSON.stringify([{service_id:'external_service2',description:'description',uri:'external-service2:80',image:'image'}]), {'Content-type': 'application/json'})
        .post('/v1/forward/callback')
        .reply(200)
/*        .get('/v1/service/domainlist')
        .reply(200, JSON.stringify([{service_id:'external_service',description:'description',uri:'external-service:80',image:'image'}]), {'Content-type': 'application/json'});*/
        //done();

        nock('http://working-service:80')
        .get('/wrong_uri')
        .reply(404, "The URI doesn't exist", {'Content-type': 'text/plain'})
        .get('/right_uri')
        .reply(200, {result: "OK"}, {'Content-Type': 'application/json'})
        .get('/right_uri_with_cb_response').times(2)
        .reply(202, {result: "Processing started"}, {'Content-Type': 'application/json'})
        .get('/right_uri')
        .reply(202, {result: "Processing started"}, {'Content-Type': 'application/json'})

        nock('http://po:8080')
        .post('/v1/execute/external_service/protect')
        .replyWithError('Can\'t reach PO')
        .post('/v1/execute/external_service/protect')
        .reply(200,'1')
        .post('/v1/execute/external_service/unprotect')
        .reply(200,'2')
/*        .post('/v1/execute/external_service/protect')
        .reply(200,'3')*/
        .post('/v1/execute/external_service/unprotect')
        .reply(200,'4');

        function clearDB() {
            for (var i in mongoose.connection.collections) {
                mongoose.connection.collections[i].remove(function() {});
            }
            return done();
        }

        if (mongoose.connection.readyState === 0) {
            mongoose.Promise = global.Promise;
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


    describe("request: ", function() {
        it("Non-existing service", function(done) {
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'fakeservice',
                        service_path: 'fakepath',
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;                    
                    setTimeout(function () {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('FINISHED');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(404);
                            response.body.message[0].code.should.equal('404');
                            response.body.message[0].message.should.equal('service not found');
                            done();
                        });
                    }, 1000);
                }
            );
        });

        it("Non-responding service", function(done) {
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'error_service',
                        service_path: '/errorpath',
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;
                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('FINISHED');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(503);
                            response.body.message[0].code.should.equal('503');
                            response.body.message[0].message.should.equal('cannot reach service');
                            done();
                        });      
                    }, 3000);
                }
            );
        });

        it("Service responds but the URI is wrong", function(done) {
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'working_service',
                        service_path: '/wrong_uri',
                        method: 'GET',
                        headers: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;
                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('FINISHED');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(404);
                            response.body.should.equal('The URI doesn\'t exist');
                            done();
                        });
                    },2000);
                }
            );
        });

        it("Service responds and the call was successful", function(done) {
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'working_service',
                        service_path: '/right_uri',
                        method: 'GET',
                        headers: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;
                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('FINISHED');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(200);
                            response.body.should.deepEqual({result: "OK"});
                            done();
                        });
                    }, 1000);
                }
            );
        });

        it("Service responds with 202 and the service callback is simulated", function(done) {
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'working_service',
                        service_path: '/right_uri_with_cb_response',
                        method: 'GET',
                        headers: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;
                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('IN_PROGRESS');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(202);
                            response.body.should.deepEqual( {result: "Processing started"});

                            ForwardingHandler.requestCallback(request_id, {},{result: "callback_result"},
                            function(error) {
                                should.not.exist(error);
                                setTimeout(function() {
                                    RequestHandler.getRequest(request_id, function(error, request) {
                                        should.not.exist(error);
                                        should.exist(request);
                                        request.origin.should.equal('local');
                                        request.status.should.equal('FINISHED');
                                        var size = request.request_log.length;
                                        var response = request.request_log[size-1].response;
                                        response.status.should.equal(200);
                                        response.body.should.deepEqual( {result: "callback_result"});
                                        done();
                                    });
                                },1000);
                            });

                        });
                    }, 1000);
                }
            );
        });

        it("The service is in the external domain (PO can't be contacted for protection)", function(done) {
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'external_service',
                        service_path: '/dowork',
                        method: 'GET',
                        headers: {'X-Auth-Token': "the_token"}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;
                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('FINISHED');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(503);
                            response.body.should.have.property('message');
                            response.body.message[0].should.have.property('code');
                            response.body.message[0].code.should.equal('503');
                            response.body.message[0].should.have.property('message');
                            response.body.message[0].message.should.equal('can not reach protection service');
                            response.body.message[0].should.have.property('path');

                            done();
                        });
                    }, 2000);
                }
            );
        });

        it("The service is in the external domain", function(done) {
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'external_service',
                        service_path: '/dowork',
                        method: 'GET',
                        headers: {'X-Auth-Token': "the_token"}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;
                    requestId = request_id;
                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('PROTECTING');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(200);
                            response.body.should.equal("1");

                            done();
                        });
                    }, 2000);
                }
            );
        });
    });
    
    describe("requestCallback: ", function() {
        it("Callback from the PO to finish protection", function(done) {
            ForwardingHandler.requestCallback(requestId,{},{status:'success',results:[{key:'modifiedServiceParams',value:{}}]}, function(error) {
                should.not.exist(error);
                setTimeout(function() {
                    RequestHandler.getRequest(requestId, function(error, request) {
                        should.not.exist(error);
                        should.exist(request);
                        request.origin.should.equal('local');
                        request.status.should.equal('FORWARDED');
                        var size = request.request_log.length;
                        var response = request.request_log[size-1].response;
                        response.status.should.equal(202);
                        response.body.should.equal('12345');
                        done();
                    });
                }, 2000);
            });
        });

        it("Callback from a service from the same domain", function(done) {
            // First we need to create a request to that service so the request exists in the database and then we can simulate the callback from the service
            ForwardingHandler.request(
                {
                    request: {
                        service_name: 'working_service',
                        service_path: '/right_uri_with_cb_response',
                        method: 'GET',
                        headers: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;
                    setTimeout(function() {
                        // Then we check that the request is in progress
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);
                            request.origin.should.equal('local');
                            request.status.should.equal('IN_PROGRESS');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(202);
                            response.body.should.deepEqual( {result: "Processing started"});

                            // And finally we simulate the callback from the service
                            ForwardingHandler.requestCallback(request_id, {},{result: "callback_result"},
                            function(error) {
                                should.not.exist(error);
                                setTimeout(function() {
                                    RequestHandler.getRequest(request_id, function(error, request) {
                                        should.not.exist(error);
                                        should.exist(request);
                                        request.origin.should.equal('local');
                                        request.status.should.equal('FINISHED');
                                        var size = request.request_log.length;
                                        var response = request.request_log[size-1].response;
                                        response.status.should.equal(200);
                                        response.body.should.deepEqual( {result: "callback_result"});
                                        done();
                                    });
                                },1000);
                            });

                        });
                    }, 1000);
                }
            );
        });

    it("Callback from the PO to finish unprotection", function(done) {
        // First we need a request that is in unprotecting state. We use a request that is in forwarded state and simulate the forward/callback from the other domain
        ForwardingHandler.forwardCallback({
                request_id: requestId,
                response_status: 200,
                response_headers: {'Content-Type': 'application/json'},
                response_data: {
                    data: {result: "This is the service result"}
                }
            }, function(error) {
                should.not.exist(error);
                setTimeout(function() {
                    // Once the forward callback is received the request should be in unprotecting state
                    RequestHandler.getRequest(requestId, function(error, request) {
                        should.not.exist(error);
                        should.exist(request);
                        request.origin.should.equal('local');
                        request.status.should.equal('UNPROTECTING');
                        var size = request.request_log.length;
                        var response = request.request_log[size-1].response;
                        response.status.should.equal(200);
                        response.body.should.equal('2');

                        // Callback from the PO
                        ForwardingHandler.requestCallback(requestId,{},{status:'success',results:[{key:'modifiedServiceParams',value:{result: "This is the service result"}}]}, function(error) {
                            should.not.exist(error);
                            setTimeout(function() {
                                // Now the request should be finished
                                RequestHandler.getRequest(requestId, function(error, request) {
                                    should.not.exist(error);
                                    should.exist(request);
                                    request.origin.should.equal('local');
                                    request.status.should.equal('FINISHED');
                                    var size = request.request_log.length;
                                    var response = request.request_log[size-1].response;
                                    response.status.should.equal(200);
                                    response.body.should.deepEqual({result: "This is the service result"});
                                });
                            }, 1000);
                            
                        });
                        done();
                    });
                }, 1000);
            }
        );
    });

    });


    describe("forward: ", function() {
        it("forward/domain call to a non-existing service in this domain", function(done) {
            ForwardingHandler.forward(__brokerConfig.broker_ed.domain_name,
                {
                    request: {
                        original_id: requestId,
                        service_name: 'missing_external_service',
                        service_path: '/dowork',
                        method: 'GET',
                        headers: {'X-Auth-Token': "the_token"},
                        body: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;

                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.not.exist(request);

                            done();
                        });
                    }, 1000);
                }
            );
        });

        it("forward/domain call to a non-existing service in this domain but the service exist in other domain", function(done) {
            ForwardingHandler.forward(__brokerConfig.broker_ed.domain_name,
                {
                    request: {
                        original_id: requestId,
                        service_name: 'external_service2',
                        service_path: '/dowork',
                        method: 'GET',
                        headers: {'X-Auth-Token': "the_token"},
                        body: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;

                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.not.exist(request);

                            done();
                        });
                    }, 1000);
                }
            );
        });

        it("forward/domain call to an existing service in this domain", function(done) {
            // Process a forward domain call from the other domain
            ForwardingHandler.forward(__brokerConfig.broker_ed.domain_name, 
                {
                    request: {
                        original_id: requestId,
                        service_name: 'working_service',
                        service_path: '/right_uri',
                        method: 'GET',
                        headers: {'X-Auth-Token': "the_token"},
                        body: {}
                    }
                },
                function(error, request_id) {
                    should.not.exist(error);
                    should.exist(request_id);
                    request_id.should.be.a.string;

                    setTimeout(function() {
                        RequestHandler.getRequest(request_id, function(error, request) {
                            should.not.exist(error);
                            should.exist(request);

                            request.origin.should.equal(__brokerConfig.broker_ed.domain_name);
                            request.status.should.equal('IN_PROGRESS');
                            var size = request.request_log.length;
                            var response = request.request_log[size-1].response;
                            response.status.should.equal(202);
                            response.body.should.deepEqual({result: "Processing started"});

                            done();
                        });
                    }, 1000);

                }
            );
        });
        
    });

    describe("forwardCallback: ", function() {
        it('forward/callback to a request that isn\'t in FORWARDED state', function(done) {
            // First we create a new request in IN_PROGRESS state
            RequestHandler.createRequest('local', 
                {
                    request: {
                        service_name: 'external_service',
                        service_path: '/dowork',
                        method: 'GET',
                        headers: {},
                        body: {}
                    }
                },
                function(error, request) {
                    requestId = request.id;
                    setTimeout(function() {
                        ForwardingHandler.forwardCallback(
                            {
                                request_id: requestId,
                                response_status: 200,
                                response_headers: {'Content-Type': 'application/json'},
                                response_data: {data: "response from remote service"}
                            },
                            function(error) {
                                should.exist(error);
                                error.should.deepEqual({name: "CastError", message: "Can not find request"});
                                
                                done();
                            }
                        );
                    }, 1000);
                }
            );
        });

        it('forward/callback to a request that is in FORWARDED state', function(done) {
            // First pass the request from PROTECTING to FORWARDED
            // Put the request in FORWARDED state
            RequestHandler.updateRequest(requestId, 'FORWARDED', 
                {
                    response:
                        {
                            service_name: 'external_service',
                            service_path: '/dowork',
                            status: 202,
                            headers: {'Content-Type': 'text/plain'},
                            body: "12346"
                        }
                },
                function(error, request) {
                    should.not.exist(error);
                    should.exist(request);

                    ForwardingHandler.forwardCallback(
                        {
                            request_id: requestId,
                            response_status: 200,
                            response_headers: {'Content-Type': 'application/json'},
                            response_data: {data: "response from remote service"}
                        },
                        function(error) {
                            should.not.exist(error);
                            
                            setTimeout(function() {
                                RequestHandler.getRequest(requestId, function(error, request) {
                                    should.not.exist(error);
                                    should.exist(request);

                                    request.origin.should.equal('local');
                                    request.status.should.equal('UNPROTECTING');
                                    var size = request.request_log.length;
                                    var response = request.request_log[size-1].response;
                                    response.status.should.equal(200);
                                    response.body.should.equal('4');

                                    done();
                                });
                            }, 1000);

                        }
                    );

                }
            );
        });

    });

});