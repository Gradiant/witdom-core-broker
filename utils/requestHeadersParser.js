'use strict';
var url = require('url');
var queryString = require('querystring');

/**
 * This middleware reads the HTTP headers from request and puts
 * them inside request.swagger.params.headers.value
 * Only for the methods '/request/create' and '/request/create_blocker'
 * 
 * It also adds the query string to the parameter service_uri if it
 * doesn't have it yet, this is needed because of the way Swagger parses
 * path parameters (this will be move to other middleware in future releases)
 */
function requestHeadersParser(request, response, next) {
    if (request.url.startsWith('/docs') || request.url.startsWith('/api-docs')) { //Don't check docs URLs
        next();
        return;
    }
    if (request.swagger.apiPath.startsWith('/request/create') || request.swagger.apiPath.startsWith('/request/callback')) {
        request.swagger.params['headers'] = {
            value: request.headers
        };
    }
    if (request.swagger.apiPath.startsWith('/request/create')) {
        if (request.url.indexOf('?') > -1) {
            request.swagger.params['querystring'] = {
                value: queryString.unescape(url.parse(request.url).query)
            }
        }
        if (request.swagger.params.querystring != undefined) {
            if (request.swagger.params.service_uri.value.indexOf('?') == -1) { //Means there is a query string but it is not present in service_uri
                request.swagger.params.service_uri.value += '?' + request.swagger.params.querystring.value; 
            }
        }
    }
    next();
}

module.exports = requestHeadersParser;