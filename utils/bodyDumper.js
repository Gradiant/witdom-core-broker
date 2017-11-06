'use strict';

/**
 * This middleware just prints the request body of the 'request/callback' calls and continues to the next middleware
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 */

function bodyDumper(request, response, next) {
    if (request.url.startsWith('/docs') || request.url.startsWith('/api-docs')) { //Don't check docs URLs
        next();
        return;
    }
    if (request.swagger.apiPath.startsWith('/request/callback')) {
        __logger.silly('Raw body: ' + request.rawBody);
    }
    next();

}

module.exports = bodyDumper;