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

var Request = require('./RequestService');

module.exports.requestCreateGET = function requestCreateGET (req, res, next) {
    Request.requestCreateGET(req.swagger.params, res, next);
};

module.exports.requestCreatePOST = function requestCreatePOST (req, res, next) {
    Request.requestCreatePOST(req.swagger.params, res, next);
};

module.exports.requestCreate_blockerGET = function requestCreate_blockerGET (req, res, next) {
    Request.requestCreate_blockerGET(req.swagger.params, res, next);
};

module.exports.requestCreate_blockerPOST = function requestCreate_blockerPOST (req, res, next) {
    Request.requestCreate_blockerPOST(req.swagger.params, res, next);
};

module.exports.requestGetresultGET = function requestGetresultGET (req, res, next) {
    Request.requestGetresultGET(req.swagger.params, res, next);
};

module.exports.requestCallbackPOST = function requestCallbackPOST (req, res, next) {
    Request.requestCallbackPOST(req.swagger.params, res, next);
};
