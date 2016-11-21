global.__brokerConfig = require('../../config');
__brokerConfig.tokenValidationModule = "openstack-token-utils";


var should = require("should");
delete require.cache[require.resolve('../../utils/tokenValidator')];
var tokenValidator = require('../../utils/tokenValidator');


var auth = require(__brokerConfig.tokenValidationModule);
var authService = new auth.TokenValidationService(__brokerConfig.tokenValidationService.endpoint, __brokerConfig.tokenValidationService.admin.user, __brokerConfig.tokenValidationService.admin.pass);

describe("iam tokenValidator", function() {
    it("correct token test", function(done) {
        authService.getAuthToken("testuser", "testuser", function(error, token) {
            should.not.exist(error);
            tokenValidator.validateToken('testuser',token, function() {
                done();
            }, function(error) {
                done('The token is incorrect');
            }, 'error');
        });        
    });
    it("wrong token test", function(done) {
        tokenValidator.validateToken('a','wrong token', function() {
            done("The token was validated and it was supposed to be incorrect");
        }, function(error) {
            error.should.equal('error');
            done();
        }, 'error');
    });
});