'use strict';

/**
 * This module is only for testing and developing, it basically
 * allows any http (without ssl) to pass as if it has a valid certificate
 **/ 
function httpAuthValidator(request, response, next) {

    if (!request.client.encrypted) request.client.authorized = true;
    next();
}

module.exports = httpAuthValidator;