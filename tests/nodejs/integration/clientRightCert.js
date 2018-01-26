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
    key: fs.readFileSync(config.https.right_client_key),
    cert: fs.readFileSync(config.https.right_client_cert)
};

// server to test
var server = supertest.agent("https://" + config.https.host + ":" + config.https.port +"/v1", options)


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