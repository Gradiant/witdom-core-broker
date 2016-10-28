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
var server = supertest.agent("https://localhost:5043/v1", options)


describe("Syntax (https): ", function() {
    // services test
    describe("Services : ", function() {
        // services list
        it("list", function(done) {
            server
            .get('/service/list')
            .set('Accept', /json/)
            .query({ 
                user: "string",
                token: 'string'
            })
            .expect(200)
            .expect('Content-type',/json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Array;
                    service1 = response.body[0];
                    Object.keys(service1).should.have.length(4);
                    service1.should.have.property('image').which.is.a.String;
                    service1.should.have.property('service_id').which.is.a.String;
                    service1.should.have.property('description').which.is.a.String;
                    service1.should.have.property('uri').which.is.a.String;
                    done();
                }
            });
        });

        // services domain list
        it("domain list", function(done) {
            server
            .get('/service/domainlist')
            .set('Accept', /json/)
            .query({ 
                user: "string",
                token: 'string'
            })
            .expect(200)
            .expect('Content-type',/json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Array;
                    service1 = response.body[0];
                    Object.keys(service1).should.have.length(4);
                    service1.should.have.property('image').which.is.a.String;
                    service1.should.have.property('service_id').which.is.a.String;
                    service1.should.have.property('description').which.is.a.String;
                    service1.should.have.property('uri').which.is.a.String;
                    done();
                }
            });
        });

        // services outside list
        it("outside list", function(done) {
            server
            .get('/service/outsidelist')
            .set('Accept', /json/)
            .query({ 
                user: "string",
                token: 'string'
            })
            .expect(200)
            .expect('Content-type',/json/)
            .end(function(error, response) {
                if (error) {
                    done(error);
                }
                else {
                    response.body.should.be.an.Array;
                    service1 = response.body[0];
                    Object.keys(service1).should.have.length(4);
                    service1.should.have.property('image').which.is.a.String;
                    service1.should.have.property('service_id').which.is.a.String;
                    service1.should.have.property('description').which.is.a.String;
                    service1.should.have.property('uri').which.is.a.String;
                    done();
                }
            });
        });

        // service details
        it("details", function(done) {
            server
            .get('/service/details')
            .set('Accept', /json/)
            .query({
                user: "string",
                token: 'string',
                service: 'service_id'
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