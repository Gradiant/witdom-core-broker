var supertest = require("supertest");
var should = require("should");
var fs = require('fs');
var config = require('./config');

var options = {
    ca: fs.readFileSync(config.https.ca_cert),
    key: fs.readFileSync(config.https.wrong_client_key),
    cert: fs.readFileSync(config.https.wrong_client_cert)
};

// server to test
var server = supertest.agent("https://localhost:" + config.https.port +"/v1", options)


describe("Wrong cert : ", function() {
    // Test to check the use of an invalid certificate
    it("The connection is rejected due to an invalid certificate", function(done) {
        server
        .get('/service/list')
        .set('Accept', /json/)
        .expect('Content-type',/json/)
        .expect(401, {
                 "message":[{
                     "code":"401",
                     "status":"denied",
                     "message":"Authorization failed: wrong certificate provided",
                     "path":["/v1/service/list"]
                    }]
        }, done);
    });

    it("The connection is rejected due to an invalid certificate and token", function(done) {
        server
        .get('/service/list')
        .set('Accept', /json/)
        .set({
            'X-Auth-Token': 'string'
        })
        .expect('Content-type',/json/)
        .expect(401, {
                 "message":[{
                     "code":"401",
                     "status":"denied",
                     "message":"Authorization failed: wrong certificate and token provided",
                     "path":["/v1/service/list"]
                    }]
        }, done);
    });
});