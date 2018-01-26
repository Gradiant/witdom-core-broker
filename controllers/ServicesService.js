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

var brokerConfig = require('../config');
var orchestrator = require(brokerConfig.orchestrator.name).Orchestrator;
var mongoose = require('mongoose');
var Service = require('../models/mongo/service');
//var ServiceInfo = require(__base + 'service_info/ServiceInfo');
var ServiceInfo = require(__brokerConfig.serviceInfoModule);

function sendResponse(error, response, response_data, next) {
    if (error) {
        response.setHeader('Content-Type', 'application/json');
        response.writeHead(error.code);
        response.end(JSON.stringify({message: [error]}));
    } else {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(response_data || {}, null, 2));
    } 
    next();
}

exports.serviceDetailsGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * service (String)
     * xAuthToken (String)
     **/
    
    // Retrieve from database
    var service_id = args.service.value;

    ServiceInfo.find(service_id, function(error, service) {
        sendResponse(error, response, service, next);
    });    
}

exports.serviceDomainlistGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * xAuthToken (String)
     **/

    // Retrive from database with local source
    ServiceInfo.domainList(function(error, services) {
        sendResponse(error, response, services, next);
    });
}

exports.serviceListGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * xAuthToken (String)
     **/

    // TODO, how to use database
    ServiceInfo.list(function(error, services) {
        sendResponse(error, response, services, next);
    });
}

exports.serviceOutsidelistGET = function(args, response, next) {
    /**
     * parameters expected in the args:
     * xAuthToken (String)
     **/

    // TODO retrieve services from untrusted domains
    ServiceInfo.outsideList(function(error, services) {
        sendResponse(error, response, services, next);
    });
}

