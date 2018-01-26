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
global.__base = __dirname + "/../../../";
global.__brokerConfig = require('./config');
__brokerConfig.tokenValidationModule = __base + "validators/dummyTokenValidation";

var should = require("should");
delete require.cache[require.resolve(__base + 'utils/tokenValidator')];
var tokenValidator = require(__base + 'utils/tokenValidator');

describe("dummy tokenValidator" , function() {
    it("correct token test", function(done) {
        tokenValidator.validateToken('right token', function() {
            done();
        }, function(error) {
            done('Error, the token isn\'t valid');
            error.should.equal('error');
            done();
        }, 'error');
    });
    it("wrong token test", function(done) {
        tokenValidator.validateToken('wrongToken', function() {
            done('Error, the token is valid');
        }, function(error) {
            error.should.equal('error');
            done();
        }, 'error');
    });
});