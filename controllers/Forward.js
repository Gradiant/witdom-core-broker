'use strict';

var url = require('url');

var Forward = require('./ForwardService');


module.exports.forwardDomainPOST = function forwardDomainPOST (req, res, next) {
    Forward.forwardDomainPOST(req.swagger.params, res, next);
};
