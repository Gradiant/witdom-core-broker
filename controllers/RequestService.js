'use strict';

var brokerConfig = require('../config');
var mongoose = require('mongoose');
var Service = require('../models/mongo/service');
var unirest = require('unirest');
var requestForwardingHandler = require('../request_forwarding/requestForwardingHandler');

exports.requestCreatePOST = function(args, res, next) {
    /**
   * parameters expected in the args:
   * user (String)
   * token (String)
   * service (Request)
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

exports.requestCreate_blockerPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * user (String)
   * token (String)
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

exports.requestCallbackPOST = function(args, res, next) {
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

