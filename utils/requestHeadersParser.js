'use strict';
var url = require('url');
var queryString = require('querystring');

/**
 * This middleware reads the HTTP headers from request and puts
 * them inside request.swagger.params.headers.value
 * Only for the methods '/request/create', '/request/create_blocker', '/request/callback' and '/request/getresult'
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
    if (request.swagger.apiPath.startsWith('/request/create') || request.swagger.apiPath.startsWith('/request/callback') || request.swagger.apiPath.startsWith('/request/getresult')) {
        request.swagger.params['headers'] = {
            value: request.headers
        };
        //Skip calling PO for protect/unprotect if the header X-Skip-PO is set to true
        if (request.swagger.params['X-Skip-PO'] && (request.swagger.params['X-Skip-PO'].value === 'true')) {
            request.swagger.params['skip_po'] = {
                value: 'true'
            }
        }
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