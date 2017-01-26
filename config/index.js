var _ = require("lodash");
var defaults = require("./default.js");

console.log('Custom config file: ' + __customConfigFile);

//var config = require("./custom.js");
var config = require(__customConfigFile);

function customizer(objValue, srcValue) {
  if (_.isObject(objValue)) {
      //console.log(objValue);
      //console.log(srcValue);
    return srcValue;
  }
}
 
 
module.exports = _.mergeWith({}, defaults, config, customizer);

//module.exports = _.merge({}, defaults, config);