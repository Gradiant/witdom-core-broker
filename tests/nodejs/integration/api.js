var supertest = require("supertest");
var should = require("should");

// server to test
var server = supertest.agent("http://localhost:5000/v1")

describe("Syntax : ", function() {
    // services test
    describe("Services : ", function() {
        // services list
        it("list : OK", function(done) {
            server
            .get('/service/list')
            .set('Accept', /json/)
            .set({
                'X-Auth-Token': 'string'
            })
            .expect(200)
            .expect('Content-type', /json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Array;
                    for(index in response.body) {
                        checkServiceFormat(response.body[index]);
                    }
                    done();
                }
            });
        });

        // services domain list
        it("domain list : OK", function(done) {
            server
            .get('/service/domainlist')
            .set('Accept', /json/)
            .set({
                'X-Auth-Token': 'string'
            })
            .expect(200)
            .expect('Content-type', /json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Array;
                    for(index in response.body) {
                        checkServiceFormat(response.body[index]);
                    }
                    done();
                }
            });
        });

        // services outside list
        it("outside list : OK", function(done) {
            server
            .get('/service/outsidelist')
            .set('Accept', /json/)
            .set({
                'X-Auth-Token': 'string'
            })
            .expect(200)
            .expect('Content-type', /json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Array;
                    for(index in response.body) {
                        checkServiceFormat(response.body[index]);
                    }
                    done();
                }
            });
        });

        // service details
        it("details : OK", function(done) {
            server
            .get('/service/details')
            .set('Accept', /json/)
            .set({
                'X-Auth-Token': 'string'
            })
            .query({
                service: 'service1'
            })
            .expect(200)
            .expect('Content-type', /json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Object;
                    checkServiceFormat(response.body);
                    done();
                }
            });
        });

        // service details
        it("details : 400", function(done) {
            server
            .get('/service/details')
            .set('Accept', /json/)
            .set({
                'X-Auth-Token': 'string'
            })
            .query({
                serdice: 'service_id'    // typo
            })
            .expect(400)
            .expect('Content-type', /json/)
            .end(done);
        });

        // service details
        it("details : 400", function(done) {
            server
            .get('/service/details')
            .set('Accept', /json/)
            .set({
                'X-Auth-Token': 'string'
            })
            .expect(400)
            .expect('Content-type', /json/)
            .end(done);
        });
    });

    // requests tests
    describe("Requests : ", function() {
        // create request
        it("create_get : OK", function(done) {
            server
            .get('/request/create/google/some_path')
            .set({
                'X-Auth-Token': 'string',
                'Content-type': 'application/json',
                'Accept': 'application/json'
            })
            .expect(202)
            .expect('Content-type', /text/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    setTimeout(function() {
                        server
                        .get('/request/getresult')
                        .set({
                            'X-Auth-Token': 'string',
                            'Content-type': 'application/json',
                            'Accept': 'application/json'
                        })
                        .query({
                            request_id: response.text
                        })
                        .expect(404)
                        .expect('Content-type', /html/)
                        .end(function(error, response) {
                            if (error) {
                                done(error);
                            }
                            else {
                                response.body.should.be.a.String;
                                done();
                            }
                        });
                    }, 1000);
                }
            });
        });

        // create request
        it("create_post : OK", function(done) {
            server
            .post('/request/create/google/some_path')
            .set({
                'X-Auth-Token': 'string',
                'Content-type': 'application/json',
                'Accept': 'application/json'
            })
            .send({
                'blblblblb': "asdasdasd"
            })
            .expect(202)
            .expect('Content-type', /text/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    setTimeout(function() {
                        server
                        .get('/request/getresult')
                        .set({
                            'X-Auth-Token': 'string',
                            'Content-type': 'application/json',
                            'Accept': 'application/json'
                        })
                        .query({
                            request_id: response.text
                        })
                        .expect(404)
                        .expect('Content-type', /html/)
                        .end(function(error, response) {
                            if (error) {
                                done(error);
                            }
                            else {
                                response.body.should.be.a.String;
                                done();
                            }
                        });
                    }, 1000);
                }
            });
        });

        // create request
        it("create : 400 : malformed json data", function(done) {
            server
            .post('/request/create/string/some_path')
            .set({
                'X-Auth-Token': 'string',
                'Content-type': 'application/json',
                'Accept': 'application/json'
            })
            .send("abc")
            .expect(400)
            .expect('Content-type', /json/)
            .end(done);
        });

        // create blocker request
        it("create blocker_get : OK", function(done) {
            server
            .get('/request/create_blocker/google/some_path')
            .set({
                'X-Auth-Token': 'string',
                'Content-type': 'application/json',
                'Accept': 'application/json'
            })
            .expect(404)
            .expect('Content-type', /html/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.a.String;
                    done();
                }
            });
        });

        // create blocker request
        it("create blocker_post : OK", function(done) {
            server
            .post('/request/create_blocker/google/some_path')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .set({
                'X-Auth-Token': 'string'
            })
            .send({
            })
            .expect(404)
            .expect('Content-type', /html/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Object;
                    done();
                }
            });
        });

        // create blocker request
        it("create blocker : 400 : array instead of object", function(done) {
            server
            .post('/request/create_blocker/string/string')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .set({
                'X-Auth-Token': 'string'
            })
            .send([])
            .expect(400)
            .expect('Content-type', /json/)
            .end(done);
        });

        // get request result
        it("get result : 400 : missing data", function(done) {
            server
            .get('/request/getresult')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .set({
                'X-Auth-Token': 'string'
            })
            .expect(400)
            .expect('Content-type', /json/)
            .end(done);
        });

        // callback request
        /*it("callback : OK", function(done) {
            server
            .post('/request/callback')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .query({
                request_id: "String"
            })
            .send({
                "result_data": {"data": "String"}
            })
            .expect(200)
            //.expect('Content-type', /json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.undefined;
                    done();
                }
            });
        });

        // callback request
        it("callback : 400 : missing data", function(done) {
            server
            .post('/request/callback')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .send({
                "result_data": "string"
            })
            .expect(400)
            .expect('Content-type', /json/)
            .end(done);
        });*/

    });

    // forward
    describe("Forward : ", function() {
        // forward domain
        it("domain : OK", function(done) {
            server
            .post('/forward/domain')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .send({
                "service_name": "string",
                "request_type": "string",
                "request_uri": "string",
                "request_headers" : {},
                "request_data": {}
            })
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.a.String;
                    done();
                }
            });
        });

        // forward domain
        it("domain : 400 : missing data", function(done) {
            server
            .post('/forward/domain')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .expect('Content-type', /json/)
            .expect(400)
            .end(done);
        });

        // forward domain
        it("domain : 400 : object instead of string", function(done) {
            server
            .post('/forward/domain')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .send({
                "service_name": {"name": "String"},   // syntax
                "request_type": "string",
                "request_uri": "string",
                "request_data": {}
            })
            .expect('Content-type', /json/)
            .expect(400)
            .end(done);
        });

         // forward domain
        it("domain : 400 : string instead of object", function(done) {
            server
            .post('/forward/domain')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .send({
                "service_name": "string",
                "request_type": "string",
                "request_uri": "string",
                "request_headers": "string",   // syntax
                "request_data": {}
            })
            .expect('Content-type', /json/)
            .expect(400)
            .end(done);
        });

        // forward callback
        it("callback : OK", function(done) {
            server
            .post('/forward/callback')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .send({
                "request_id": "string",
                "response_status": "string",
                "response_headers" : {},
                "response_data": {}
            })
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.a.String;
                    done();
                }
            });
        });

        // forward callback
        it("callback : 400 : missing data", function(done) {
            server
            .post('/forward/callback')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .expect('Content-type', /json/)
            .expect(400)
            .end(done);
        });

        // forward callback
        it("callback : 400 : object instead of string", function(done) {
            server
            .post('/forward/callback')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .send({
                "request_id": {"name": "String"},   // syntax
                "response_status": "string",
                "response_headers" : {},
                "response_data": {}
            })
            .expect('Content-type', /json/)
            .expect(400)
            .end(done);
        });

         // forward callback
        it("callback : 400 : string instead of object", function(done) {
            server
            .post('/forward/callback')
            .set('Accept', /json/)
            .set('Content-type', 'application/json')
            .send({
                "request_id": "string",
                "response_status": "string",
                "response_headers" : "string",   // syntax
                "response_data": {}
            })
            .expect('Content-type', /json/)
            .expect(400)
            .end(done);
        });
    });
});

function checkServiceFormat(service) {
    Object.keys(service).should.have.length(4);
    service.should.have.property('image').which.is.a.String;
    service.should.have.property('service_id').which.is.a.String;
    service.should.have.property('description').which.is.a.String;
    service.should.have.property('uri').which.is.a.String;
}

function checkServiceResultFormat(result) {
    Object.keys(result).should.have.length(1);
    result.should.have.property('result_data').which.is.an.Object;
}

function checkErrorFormat(error) {
    Object.keys(error).should.have.length(3);
    error.should.have.property('code').which.is.a.Number;
    error.should.have.property('message').which.is.a.String;
    error.should.have.property('fields').which.is.a.String;
}