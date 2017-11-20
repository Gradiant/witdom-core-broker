'use strict';

function getRemoteIP(req) {
	var ip = req.connection.remoteAddress;
	//ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1)[0];
    return ip
}

function remoteIPHandler(request, response, next) {
    request.swagger.params['remote_ip'] = {
        value: getRemoteIP(request)
    }
    next();
}

module.exports = remoteIPHandler;