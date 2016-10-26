'use strict';

var url = require('url');


var Request = require('./RequestService');


module.exports.requestCreatePOST = function requestCreatePOST (req, res, next) {
  Request.requestCreatePOST(req.swagger.params, res, next);
};

module.exports.requestCreate_blockerPOST = function requestCreate_blockerPOST (req, res, next) {
  Request.requestCreate_blockerPOST(req.swagger.params, res, next);
};

module.exports.requestGetresultGET = function requestGetresultGET (req, res, next) {
  Request.requestGetresultGET(req.swagger.params, res, next);
};

module.exports.requestCallbackPOST = function requestUpdatePOST (req, res, next) {
  Request.requestCallbackPOST(req.swagger.params, res, next);
};
