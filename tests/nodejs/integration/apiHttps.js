var supertest = require("supertest");
var should = require("should");
var fs = require('fs');
var config = require('./config');

var options = {
    ca: fs.readFileSync(config.https.ca_cert),
    key: fs.readFileSync(config.https.right_client_key),
    cert: fs.readFileSync(config.https.right_client_cert)
};

// server to test
var server = supertest.agent("https://" + config.https.host + ":" + config.https.port +"/v1", options)


describe("Syntax (https): ", function() {
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
            .expect('Content-type',/json/)
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
            .expect('Content-type',/json/)
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
            .expect('Content-type',/json/)
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