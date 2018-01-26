/*
 *   Copyright (C) 2017  Gradiant <https://www.gradiant.org/>
 *
 *   This file is part of WITDOM Core Broker
 *
 *   WITDOM Core Broker is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   WITDOM Core Broker is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
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
var server = supertest.agent("https://" + config.https.host + ":" + config.https.port +"/v1", options)


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