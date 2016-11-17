var BrokerError = require('./brokerError');
var validator = require('./tokenValidator');

function authHandler(request, response, next) {
    if (request.client.authorized) {
        next();
        return;
    } else {
        if (request.swagger.params.token != undefined) { // Means the request admits user/token authentication
            console.log("The method admits user/token");
            validator.validateToken(request.swagger.params.user.value, request.swagger.params.token.value, function() {
                next();
            }, next, new BrokerError('INVALID_CERTIFICATE_OR_TOKEN'));
        } else {
            console.log("The method only admits certificate");
            throw new BrokerError('INVALID_CERTIFICATE');
        }
    }
}

module.exports = authHandler;