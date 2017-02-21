

/**
 * This module serves as a dummy substitute for the PO connector. It just returns the data passed in serviceCallParameters
 */
function Connector() {

}

Connector.prototype.connect = function(config ,callback) {
    __logger.silly("no_po: connect");
    callback(null);
}

Connector.prototype.protect = function(callbackUrl, service_info, request_headers, serviceCallParameters, callback) {
    __logger.silly("no_po: protect");
    callback(null, null, serviceCallParameters);
}

Connector.prototype.unprotect = function(callbackUrl, service_info, request_headers, serviceCallParameters, callback) {
    __logger.silly("no_po: unprotect");
    callback(null, null, serviceCallParameters);
}

//var Connector = module.exports = exports = new Connector;
var connector = new Connector;

module.exports = {
  Protector: connector
}