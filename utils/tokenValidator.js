var auth = require('./node-openstack-token-utils');
var brokerConfig = require('../config');

var authService = new auth.TokenValidationService(brokerConfig.keystone.endpoint, brokerConfig.keystone.admin.user, brokerConfig.keystone.admin.pass);


module.exports.validateToken = function(user, token, callback, next, throwerror) {
    authService.validateAuthenticationToken(token, function(error, tokenValid, adminToken, tokenUser) {
        if (error) {
            console.log("Keystone error:", error.status, error.message);
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
    if (user == undefined) return false;
    else if (user == token) return true;
    return false;
}