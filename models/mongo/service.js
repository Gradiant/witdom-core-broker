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
 * id: service name provided by cloudify
 * source: untrusted broker IP, local for trusted services
 * service_data: json containing the needed information about the service
 */
var ServiceSchema = new Schema({
    id: String,
    source: String,
    service_data: Object
},
{ timestamps: true});   // adds createdAt and updatedAt fields.
//{ timestamps: true, usePushEach: true});   // adds createdAt and updatedAt fields. 'usePushEach: true' is used to avoid the '$pushAll' issue in the latest mongo version

ServiceSchema.statics.findById = function findById(given_id, callback) {
    var Service = mongoose.model('Service', ServiceSchema);
    Service.find({id: given_id}, function(error, services) {
        if(error) {
            callback(error, null);
        } else {
            if(services.length == 0) {
                callback(null, null);
            } else {
                callback(null, services[0]);
            }
        }
    });
}

/**
 * Updates data
 */
ServiceSchema.methods.update = function update(source, service_data, callback) {
    this.source = source;
    this.markModified('source');
    this.service_data = service_data;
    this.markModified('service_data');
    this.save(function(error) {
        callback(error);
    });
};

/**
 * Tries to create a new service, if it exists updates it
 */
ServiceSchema.statics.saveOrUpdate = function saveOrUpdate(given_id, the_source, the_service_data, callback) {
    var Service = mongoose.model('Service', ServiceSchema);
    Service.find({id: given_id, source: the_source}, function(error, services) { // Look for the service with 'given_id' and source 'the_source'
        if(error) {
            callback(error, null);
        } else {
            if(services.length == 0) {
                var service = new Service({id: given_id, source: the_source, service_data: the_service_data});
                service.save(function(error, savedService) {
                    callback(error, savedService);
                });
            } else {
                var oldService = services[0];
                oldService.update(the_source, the_service_data, function(error) {
                    callback(error, oldService);
                });
            }
        }
    });
}

module.exports = mongoose.model('Service', ServiceSchema);
