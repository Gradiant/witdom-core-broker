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
'use strict';

var url = require('url');

var Services = require('./ServicesService');

module.exports.serviceDetailsGET = function serviceDetailsGET (req, res, next) {
    Services.serviceDetailsGET(req.swagger.params, res, next);
};

module.exports.serviceDomainlistGET = function serviceDomainlistGET (req, res, next) {
    Services.serviceDomainlistGET(req.swagger.params, res, next);
};

module.exports.serviceListGET = function serviceListGET (req, res, next) {
    Services.serviceListGET(req.swagger.params, res, next);
};

module.exports.serviceOutsidelistGET = function serviceOutsidelistGET (req, res, next) {
    Services.serviceOutsidelistGET(req.swagger.params, res, next);
};
