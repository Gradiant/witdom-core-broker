var _ = require("lodash");
var defaults = require("./default.js");
var config = require("./custom.js");

function customizer(objValue, srcValue) {
  if (_.isObject(objValue)) {
      //console.log(objValue);
      //console.log(srcValue);
    return srcValue;
  }
}
 
 
module.exports = _.mergeWith({}, defaults, config, customizer);

//module.exports = _.merge({}, defaults, config);