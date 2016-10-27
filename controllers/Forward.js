'use strict';

var url = require('url');
var BrokerError = require('../utils/brokerError');

var Forward = require('./ForwardService');


module.exports.forwardDomainPOST = function forwardDomainPOST (req, res, next) {
    if(!req.client.authorized) {
        throw new BrokerError('INVALID_CERTIFICATE');
    } else {
        Forward.forwardDomainPOST(req.swagger.params, res, next);
    }
};
