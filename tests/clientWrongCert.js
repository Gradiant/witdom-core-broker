var supertest = require("supertest");
var should = require("should");
var fs = require('fs');

var options = {
    ca: fs.readFileSync('witdomCA/witdomcacert.pem'),
    key: fs.readFileSync('untrustedCA/untrusted_client_key.pem'),
    cert: fs.readFileSync('untrustedCA/untrusted_client_crt.pem')
};

// server to test
var server = supertest.agent("https://localhost:5043/v1", options)


describe("Wrong cert : ", function() {
    // Test to check the use of an invalid certificate
    it("The connection is rejected due to an invalid certificate", function(done) {
        server
        .get('/service/list')
        .set('Accept', /json/)
        .query({ token: 'string'})
        .expect('Content-type',/json/)
        .expect(401, {
                 "message":[{
                     "code":"401",
                     "status":"denied",
                     "message":"Authorization failed: wrong certificate provided"
                    }]
        }, done);
    });
});