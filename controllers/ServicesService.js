'use strict';

exports.serviceDetailsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * token (String)
   * service (String)
   **/
    var examples = {};
  examples['application/json'] = {
  "image" : "aeiou",
  "service_id" : "aeiou",
  "description" : "aeiou",
  "uri" : "aeiou"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.serviceDomainlistGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * token (String)
   **/
    var examples = {};
  examples['application/json'] = [ {
  "image" : "aeiou",
  "service_id" : "aeiou",
  "description" : "aeiou",
  "uri" : "aeiou"
} ];
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.serviceListGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * token (String)
   **/
    var examples = {};
  examples['application/json'] = [ {
  "image" : "aeiou",
  "service_id" : "aeiou",
  "description" : "aeiou",
  "uri" : "aeiou"
} ];
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.serviceOutsidelistGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * token (String)
   **/
    var examples = {};
  examples['application/json'] = [ {
  "image" : "aeiou",
  "service_id" : "aeiou",
  "description" : "aeiou",
  "uri" : "aeiou"
} ];
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

