var supertest = require("supertest");
var should = require("should");
var fs = require('fs');

var options = {
    ca: fs.readFileSync('witdomCA/witdomcacert.pem')
};

// server to test
var server = supertest.agent("https://localhost:5043/v1", options)


describe("No cert : ", function() {
        // Test to check a connection without a certificate
        it("The connection is rejected because the client certificate is missing", function(done) {
            server
            .get('/service/list')
            .set('Accept', /json/)
            .query({ token: 'string'})
            .expect('Content-type',/json/)
            .expect(401, {
                 "message":[{
                     "code":"401",
                     "status":"denied",
                     "message":"Authorization failed: must provide valid certificate or correct user token",
                     "path":["/v1/service/list"]
                    }]
            }, done);
        });

    
});