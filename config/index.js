/*
 *   Copyright (C) 2017  Gradiant <https://www.gradiant.org/>
 *
 *   This file is part of WITDOM Core Broker
 *
 *   WITDOM Core Broker is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   WITDOM Core Broker is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
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