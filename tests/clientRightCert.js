var supertest = require("supertest");
var should = require("should");
var fs = require('fs');

var options = {
    ca: fs.readFileSync('witdomCA/witdomcacert.pem'),
    key: fs.readFileSync('witdomCA/client1_key.pem'),
    cert: fs.readFileSync('witdomCA/client1_crt.pem')
};

// server to test
var server = supertest.agent("https://localhost:5043/v1", options)


describe("Right cert : ", function() {
    // Test to check the use of a valid certificate
    it("The certificate is accepted", function(done) {
        server
        .get('/service/list')
        .set('Accept', /json/)
        .expect('Content-type',/json/)
        .expect(200)
        .end(done);
    });

});