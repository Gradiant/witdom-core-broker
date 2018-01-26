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
var should = require("should");
var nock = require('nock');

var rest = require('../index');

var httpsOptions = {
    timeout: 4000
};

var restCaller = rest.Rest;

restCaller.init(httpsOptions);


describe("Rest calls: ", function() {
    before(function(done) {
        nock('http://test:80')
        .post('/fakeuri')
        .reply(200);
        done();
    });
    it("Successfull call", function(done) {
        restCaller.doCall('http://test:80/fakeuri', 'POST', {}, {}, 5, function(error, response) {
            should.not.exist(error);
            should.exist(response);
            response.status.should.equal(200);
            done();
        });
    });

    it("Unsupported method (PUT)", function(done) {
        restCaller.doCall('http://test:80/fakeuri', 'PUT', {}, {}, 5, function(error, response) {
            should.exist(error);
            should.not.exist(response);
            error.name.should.equal('RestError');
            error.code.should.equal(100);
            error.reason.should.equal('Unsupported method');
            done();
        });
    });
    before(function(done) {
        nock('http://test:80')
        .get('/timeouturi').times(2)
        .delayConnection(5000)
        //.socketDelay(10000)
        .reply(200,"My reply")
        done();
    });
    it("Socket timeout (maximum retries)", function(done) {
        restCaller.doCall('test:80/timeouturi', 'GET', {}, {}, 1, function(error, response) {
            should.exist(error);
            should.not.exist(response);
            error.name.should.equal('RestError');
            error.code.should.equal(101);
            error.reason.should.equal('Maximum number of retries reached: ECONNABORTED');
            done();
        });
    });

    before(function(done) {
        nock('http://test:80')
        .get('/timeouturi').times(2)
        .delayConnection(5000)
        //.socketDelay(10000)
        .reply(200,"My reply")
        .get('/timeouturi')
        .reply(200,"Success");
        done();
    });

    it("Success (with retries)", function(done) {
        restCaller.doCall('http://test:80/timeouturi', 'GET', {}, {}, 2, function(error, response) {
            should.not.exist(error);
            should.exist(response);
            response.status.should.equal(200);
            response.text.should.equal("Success");
            done();
        });
    });

    it("Unknown host", function(done) {
        restCaller.doCall('http://testing:81', 'GET', {}, {}, 1, function(error, response) {
            should.exist(error);
            should.not.exist(response);
            error.name.should.equal('RestError');
            error.code.should.equal(101);
            error.reason.should.equal('Maximum number of retries reached: ENOTFOUND');
            done();
        });
    });

    it("Connection refused", function(done) {
        restCaller.doCall('http://localhost:81', 'GET', {}, {}, 1, function(error, response) {
            should.exist(error);
            should.not.exist(response);
            error.name.should.equal('RestError');
            error.code.should.equal(101);
            error.reason.should.equal('Maximum number of retries reached: ECONNREFUSED');
            done();
        });
    });


    it("Can't reach host", function(done) { // This error only happens if the IP subnet can be reached before set timeout but the host can't be reach inside that subnet
        restCaller.doCall('http://10.5.1.254:80', 'GET', {}, {}, 1, function(error, response) {
            should.exist(error);
            should.not.exist(response);
            error.name.should.equal('RestError');
            error.code.should.equal(101);
            error.reason.should.equal('Maximum number of retries reached: EHOSTUNREACH');
            done();
        });
    });
});