'use strict';

module.exports = function PoError(code, reason) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.code = code;
  this.reason = reason;
};

require('util').inherits(module.exports, Error);