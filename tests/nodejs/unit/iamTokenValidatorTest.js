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
__brokerConfig.tokenValidationModule = "openstack-token-utils";


var should = require("should");
delete require.cache[require.resolve(__base + 'utils/tokenValidator')];
var tokenValidator = require(__base + 'utils/tokenValidator');


var auth = require(__brokerConfig.tokenValidationModule);
var authService = new auth.TokenValidationService(__brokerConfig.tokenValidationService.endpoint, __brokerConfig.tokenValidationService.admin.user, __brokerConfig.tokenValidationService.admin.pass);

describe("iam tokenValidator", function() {
    it("correct token test", function(done) {
        authService.getAuthToken("testuser", "testuser", function(error, token) {
            should.not.exist(error);
            tokenValidator.validateToken(token, function() {
                done();
            }, function(error) {
                done('The token is incorrect');
            }, 'error');
        });        
    });
    it("wrong token test", function(done) {
        tokenValidator.validateToken('wrong token', function() {
            done("The token was validated and it was supposed to be incorrect");
        }, function(error) {
            error.should.equal('error');
            done();
        }, 'error');
    });
});