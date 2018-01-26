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
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * mongoose Schema
 * user_id: id of the user who started the request (what TODO if a certificate is present)
 * status: current status of the request (TODO define status types)
 * requests_log: array with all the request/response data got during the request process in json format
 */
var RequestSchema = new Schema({
    origin: String,
    status: String,
    request_log: [{}]
},
{ timestamps: true, minimize: false}); // adds createdAt and updatedAt fields. 'minimize: false' added to save empty objects in database like 'headers' or 'body'.
//{ timestamps: true, minimize: false, usePushEach: true}); // adds createdAt and updatedAt fields. 'minimize: false' added to save empty objects in database like 'headers' or 'body'.  'usePushEach: true' is used to avoid the '$pushAll' issue in the latest mongo version

/**
 * Updates both satus and requests log
 */
RequestSchema.methods.update = function update(status, requests_log, callback) {
    this.status = status;
    this.markModified('status');
    this.requests_log = requests_log;
    this.markModified('requests_log');
    this.save(function(error) {
        callback(error);
    });
};

/**
 * Updates request status
 */
RequestSchema.methods.updateStatus = function update(status, callback) {
    this.status = status;
    this.markModified('status');
    this.save(function(error) {
        callback(error);
    });
};

/**
 * Updates requests log
 */
RequestSchema.methods.updateLog = function update(log, callback) {
    this.requests_log = log;
    this.markModified('requests_log');
    this.save(function(error) {
        callback(error);
    });
};

module.exports = mongoose.model('Request', RequestSchema);
