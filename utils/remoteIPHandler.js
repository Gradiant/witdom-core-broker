'use strict';

function getRemoteIP(req) {
	var ip = req.connection.remoteAddress;
	//ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1)[0];
    return ip
}

function remoteIPHandler(request, response, next) {
    if (request.url.startsWith('/docs') || request.url.startsWith('/api-docs')) { //Don't check docs URLs
        next();
        return;
    }
    request.swagger.params['remote_ip'] = {
        value: getRemoteIP(request)
    }
    next();
}

module.exports = remoteIPHandler;