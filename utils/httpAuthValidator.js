'use strict';

/**
 * This module is only for testing and developing, it basically
 * allows any http (without ssl) to pass as if it has a valid certificate
 **/
function httpAuthValidator(request, response, next) {

    if (!request.client.encrypted) request.client.authorized = true;
/*    else {
        var cert = request.connection.getPeerCertificate();
        if (cert.subject) {
            request.client.hasCert = true;
        } else {
            request.client.hasCert = false;
        }
    }*/
    next();
}

module.exports = httpAuthValidator;