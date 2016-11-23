'use strict';

var url = require('url');
var BrokerError = require('../utils/brokerError');

var Services = require('./ServicesService');
var validator = require('../utils/tokenValidator');

module.exports.serviceDetailsGET = function serviceDetailsGET (req, res, next) {
    Services.serviceDetailsGET(req.swagger.params, res, next);
};

module.exports.serviceDomainlistGET = function serviceDomainlistGET (req, res, next) {
    Services.serviceDomainlistGET(req.swagger.params, res, next);
};

module.exports.serviceListGET = function serviceListGET (req, res, next) {
    Services.serviceListGET(req.swagger.params, res, next);
};

module.exports.serviceOutsidelistGET = function serviceOutsidelistGET (req, res, next) {
    Services.serviceOutsidelistGET(req.swagger.params, res, next);
};
