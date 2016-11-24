var supertest = require("supertest");
var should = require("should");
var fs = require('fs');
var config = require('./config');

var options = {
    ca: fs.readFileSync(config.https.ca_cert)
};

// server to test
var server = supertest.agent("https://localhost:" + config.https.port +"/v1", options)


describe("No cert : ", function() {
        // Test to check a connection without a certificate
        it("The connection is rejected because the client certificate is missing", function(done) {
            server
            .get('/service/list')
            .set('Accept', /json/)
            .expect('Content-type',/json/)
            .expect(401, {
                 "message":[{
                     "code":"401",
                     "status":"denied",
                     "message":"Authorization failed: a client certificate or user token is needed",
                     "path":["/v1/service/list"]
                    }]
            }, done);
        });

        it("The connection is rejected because the client certificate is missing and the user token isn't valid", function(done) {
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
                     "message":"Authorization failed: no certificate provided and wrong user token",
                     "path":["/v1/service/list"]
                    }]
            }, done);
        })

    
});