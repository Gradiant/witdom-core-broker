'use strict';

var request = require('superagent');

exports.requestCallbackPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service (Result)
   * request_id (String)
   **/
  // no response value expected for this operation
  res.end();
}

exports.requestCreateGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service_id (String)
   * service_uri (String)
   * xAuthToken (String)
   **/
    var examples = {};
  examples['application/json'] = "aeiou";
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.requestCreatePOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service_id (String)
   * service_uri (String)
   * request_data (Request)
   * xAuthToken (String)
   **/
    var examples = {};
  examples['application/json'] = "aeiou";
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.requestCreate_blockerGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service_id (String)
   * service_uri (String)
   * xAuthToken (String) 
   **/
    var examples = {};
  examples['application/json'] = { };
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
   * service_id (String)
   * service_uri (String)
   * request_data (Request)
   * xAuthToken (String)
   **/
    var examples = {};
  examples['application/json'] = { };
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
   * request_id (String)
   * xAuthToken (String)
   **/
    var examples = {};
  examples['application/json'] = { };
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}