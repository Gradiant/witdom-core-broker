'use strict';

exports.forwardDomainPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service (Forward_Request)
   **/
  //console.log(args.service.value);
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

exports.forwardCallbackPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * service (Forward_Callback)
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

