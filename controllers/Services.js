'use strict';

var url = require('url');
var BrokerError = require('../utils/brokerError');

var Services = require('./ServicesService');


module.exports.serviceDetailsGET = function serviceDetailsGET (req, res, next) {
    if(req.client.authorized || 
    req.swagger.params.token.value == req.swagger.params.user.value) {
        Services.serviceDetailsGET(req.swagger.params, res, next);
    } else {
        throw new BrokerError('INVALID_CERTIFICATE_OR_TOKEN');
    }
};

module.exports.serviceDomainlistGET = function serviceDomainlistGET (req, res, next) {
    if(req.client.authorized || 
    req.swagger.params.token.value == req.swagger.params.user.value) {
        Services.serviceDomainlistGET(req.swagger.params, res, next);
    } else {
        throw new BrokerError('INVALID_CERTIFICATE_OR_TOKEN');
    }
};

module.exports.serviceListGET = function serviceListGET (req, res, next) {
    if(req.client.authorized || 
    req.swagger.params.token.value == req.swagger.params.user.value) {
        Services.serviceListGET(req.swagger.params, res, next);
    } else {
        throw new BrokerError('INVALID_CERTIFICATE_OR_TOKEN');
    }
};

module.exports.serviceOutsidelistGET = function serviceOutsidelistGET (req, res, next) {
    if(req.client.authorized || 
    req.swagger.params.token.value == req.swagger.params.user.value) {
        Services.serviceOutsidelistGET(req.swagger.params, res, next);
    } else {
        throw new BrokerError('INVALID_CERTIFICATE_OR_TOKEN');
    }
};
