'use strict';

var url = require('url');
var BrokerError = require('../utils/brokerError');

var Request = require('./RequestService');
var validator = require('../utils/tokenValidator');

module.exports.requestCreatePOST = function requestCreatePOST (req, res, next) {
    if(req.client.authorized || 
    validator.validateToken(req.swagger.params.user.value, req.swagger.params.token.value)) {
        Request.requestCreatePOST(req.swagger.params, res, next);
    } else {
        throw new BrokerError('INVALID_CERTIFICATE_OR_TOKEN');
    }
};

module.exports.requestCreate_blockerPOST = function requestCreate_blockerPOST (req, res, next) {
    if(req.client.authorized || 
    validator.validateToken(req.swagger.params.user.value, req.swagger.params.token.value)) {
        Request.requestCreate_blockerPOST(req.swagger.params, res, next);
    } else {
        throw new BrokerError('INVALID_CERTIFICATE_OR_TOKEN');
    }
};

module.exports.requestGetresultGET = function requestGetresultGET (req, res, next) {
    if(req.client.authorized || 
    validator.validateToken(req.swagger.params.user.value, req.swagger.params.token.value)) {
        Request.requestGetresultGET(req.swagger.params, res, next);
    } else {
        throw new BrokerError('INVALID_CERTIFICATE_OR_TOKEN');
    }
};

module.exports.requestCallbackPOST = function requestUpdatePOST (req, res, next) {
    if(!req.client.authorized) {
        throw new BrokerError('INVALID_CERTIFICATE');
    } else {
        Request.requestCallbackPOST(req.swagger.params, res, next);
    }
};
