'use strict';

exports.callbackSuccessPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * service (Result)
  * request_id (String)
  **/
    var examples = {};
  examples['application/json'] = {
  "result_data" : "aeiou"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.callbackErrorPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * service (Result)
  * request_id (String)
  **/
    var examples = {};
  examples['application/json'] = {
  "result_data" : "aeiou"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}
