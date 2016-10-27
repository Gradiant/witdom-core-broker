'use strict';

module.exports = function BrokerError(reason) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.reason = reason;
};

require('util').inherits(module.exports, Error);