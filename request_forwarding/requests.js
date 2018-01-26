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

var Request = require(__base + 'models/mongo/request');

function RequestHandler(){}

/**
 * Saves the new request to the database
 */
RequestHandler.prototype.createRequest = function(origin, request_data, callback) {

    __logger.debug("RequestHandler.createRequest");
    __logger.silly("RequestHandler.createRequest: request_data");
    __logger.silly(request_data);

    // Save request in the database
    var new_request = new Request({origin: origin, status: 'IN_PROGRESS', request_log: [request_data]});
    new_request.save(function(error, request) {
        if(error) {
            __logger.error("RequestHandler.createRequest: error saving request to database");
            __logger.debug("RequestHandler.createRequest: trace");
            __logger.debug(error);
        }
        // Return error or data
        callback(error, request);
    });
}

/**
 * Updates the request status and adds new_data to the end of the request_log array.
 */
RequestHandler.prototype.updateRequest = function(request_id, status, new_data, callback) {

    __logger.debug("RequestHandler.updateRequest")
    __logger.silly("RequestHandler.updateRequest: new_data");
    __logger.silly(new_data);

    // Get request identified by given request_id
    Request.findById(request_id, function(error, request) {
        if(error) {
            __logger.error("RequestHandler.updateRequest: error finding request in database");
            __logger.debug("RequestHandler.updateRequest: trace");
            __logger.debug(error);
            callback(error, null);
        } else if (request) {
            // Push new_data to request log
            var new_log = request.request_log;
            new_log.push(new_data);
            // Update request
            request.update(status, new_log, function(error) {
                if(error) {
                    __logger.error("RequestHandler.updateRequest: error saving request to database");
                    __logger.debug("RequestHandler.updateRequest: trace");
                    __logger.debug(error);
		    __logger.debug('update request error: ' + JSON.stringify(error,null,2));
                }
                callback(error, request);
            });
        } else {
            callback(error, request);
        }
    });
}

/**
 * Retrieves the request from the database.
 */
RequestHandler.prototype.getRequest = function(request_id, callback) {

    __logger.debug("RequestHandler.getRequest")
    __logger.silly("RequestHandler.getRequest: request_id: " + request_id);

    // Get request identified by given request_id
    Request.findById(request_id, function(error, request) {
        if(error) {
            __logger.warn("RequestHandler.getRequest: error finding request in database");
            __logger.silly("RequestHandler.getRequest: trace");
            __logger.silly(error);
        }
        callback(error, request);
    });
}

/**
 * Removes the request from the database, it also removes the associated response_object from memory if exists.
 */
RequestHandler.prototype.deleteRequest = function(request_id, callback) {

    __logger.debug("RequestHandler.deleteRequest")
    __logger.silly("RequestHandler.deleteRequest: request_id: " + request_id);

    // Delete request identified by given id
    Request.remove({_id: request_id}, function(error, request) {
        if(error) {
            __logger.error("RequestHandler.deleteRequest: error deleting request from database");
            __logger.debug("RequestHandler.deleteRequest: trace");
            __logger.debug(error);
        }
        callback(error, request);
    });
}

var requestHandler = module.exports = exports = new RequestHandler;
