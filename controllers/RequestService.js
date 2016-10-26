'use strict';

exports.requestCreatePOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * service (Request)
  **/
    var examples = {};
  examples['application/json'] = "A57910A6DE9366BC81731895FF";
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.requestCreate_blockerPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * service (Request)
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

exports.requestGetresultGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  * user (String)
  * token (String)
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

exports.requestUpdatePOST = function(args, res, next) {
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

