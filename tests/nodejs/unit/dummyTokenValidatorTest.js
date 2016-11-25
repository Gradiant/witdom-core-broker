global.__brokerConfig = require('./config');
global.__base = __dirname + "/../../../"; 
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