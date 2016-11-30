var BrokerError = require('./brokerError');
var validator = require('./tokenValidator');

function authHandler(request, response, next) {
    if (request.url.startsWith('/docs') || request.url.startsWith('/api-docs')) { //Admit access to swagger docs without client certificate
        next();
        return;
    }
    if (request.client.authorized) {
        next();
        return;
    } else {
        if (request.swagger.params['X-Auth-Token'] != undefined) { // Means the request admits user/token authentication
            //console.log("The method admits user/token");
            validator.validateToken(request.swagger.params['X-Auth-Token'], function() {
                next();
            }, next, new BrokerError('INVALID_CERTIFICATE_OR_TOKEN'));
            return;
        } else {
            //console.log("The method only admits certificate");
            throw new BrokerError('INVALID_CERTIFICATE');
        }
    }
}

module.exports = authHandler;