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


describe("Right cert : ", function() {
    // Test to check the use of a valid certificate
    it("The certificate is accepted", function(done) {
        server
        .get('/service/list')
        .set('Accept', /json/)
        .query({ token: 'string'})
        .expect('Content-type',/json/)
        .expect(200)
        .end(done);
    });

});