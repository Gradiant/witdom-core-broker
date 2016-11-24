var _ = require("lodash");
var defaults = require("./default.js");
var config = require("./custom.js");
module.exports = _.merge({}, defaults, config);