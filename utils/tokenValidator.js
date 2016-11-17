var brokerConfig = require('../config');

var auth = require(brokerConfig.tokenValidationModule);

var BrokerError = require('./brokerError');

var authService = new auth.TokenValidationService(brokerConfig.tokenValidationService.endpoint, brokerConfig.tokenValidationService.admin.user, brokerConfig.tokenValidationService.admin.pass);


module.exports.validateToken = function(user, token, callback, next, throwerror) {
    if (user == undefined || token == undefined) {
        next(throwerror);
        return;
    }
    authService.validateAuthenticationToken(token, function(error, tokenValid, tokenUser) {
        if (error) {
            console.log("Validation service error:", error.status, error.message);
            next(new BrokerError("COULDNT_VALIDATE_TOKEN"));
        } else {
            if (tokenValid) {
                if (tokenUser == user) {
                    console.log("The token is valid");
                    if (typeof callback === "function") {
                        callback();
                    }
                } else {
                    console.log("The token is valid but the provided user doesn't match the token user (" + tokenUser+ ")");
                    next(throwerror);
                }
            } else {
                console.log("Token is not valid");
                next(throwerror);
            }
        }
    });
}