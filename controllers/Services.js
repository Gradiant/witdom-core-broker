'use strict';

var url = require('url');
var BrokerError = require('../utils/brokerError');

var Services = require('./ServicesService');
var validator = require('../utils/tokenValidator');

module.exports.serviceDetailsGET = function serviceDetailsGET (req, res, next) {
    if(req.client.authorized) { 
        Services.serviceDetailsGET(req.swagger.params, res, next);
    } else {
        validator.validateToken(req.swagger.params.user.value, req.swagger.params.token.value, function() {
            Services.serviceDetailsGET(req.swagger.params, res, next);
        }, next, new BrokerError('INVALID_CERTIFICATE_OR_TOKEN'));
    }
};

module.exports.serviceDomainlistGET = function serviceDomainlistGET (req, res, next) {
    if(req.client.authorized) { 
        Services.serviceDomainlistGET(req.swagger.params, res, next);
    } else {
        validator.validateToken(req.swagger.params.user.value, req.swagger.params.token.value, function() {
            Services.serviceDomainlistGET(req.swagger.params, res, next);
        }, next, new BrokerError('INVALID_CERTIFICATE_OR_TOKEN'));
    }
};

module.exports.serviceListGET = function serviceListGET (req, res, next) {
    if(req.client.authorized) { 
        Services.serviceListGET(req.swagger.params, res, next);
    } else {
        validator.validateToken(req.swagger.params.user.value, req.swagger.params.token.value, function() {
            Services.serviceListGET(req.swagger.params, res, next);
        }, next, new BrokerError('INVALID_CERTIFICATE_OR_TOKEN'));
    }
};

module.exports.serviceOutsidelistGET = function serviceOutsidelistGET (req, res, next) {
    if(req.client.authorized) { 
        Services.serviceOutsidelistGET(req.swagger.params, res, next);
    } else {
        validator.validateToken(req.swagger.params.user.value, req.swagger.params.token.value, function() {
            Services.serviceOutsidelistGET(req.swagger.params, res, next);
        }, next, new BrokerError('INVALID_CERTIFICATE_OR_TOKEN'));
    }
};
