'use strict';

var url = require('url');


var Callback = require('./CallbackService');

module.exports.callbackSuccessPOST = function callbackSuccessPOST (req, res, next) {
  Callback.callbackSuccessPOST(req.swagger.params, res, next);
};

module.exports.callbackErrorPOST = function callbackErrorPOST (req, res, next) {
  Callback.callbackErrorPOST(req.swagger.params, res, next);
};