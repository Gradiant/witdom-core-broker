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
{ timestamps: true});   // adds createdAt and updatedAt fields

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
ServiceSchema.statics.saveOrUpdate = function saveOrUpdate(given_id, source, service_data, callback) {
    var Service = mongoose.model('Service', ServiceSchema);
    Service.find({id: given_id}, function(error, services) {
        if(error) {
            callback(error, null);
        } else {
            if(services.length == 0) {
                var service = new Service({id: given_id, source: source, service_data: service_data});
                service.save(function(error, savedService) {
                    callback(error, savedService);
                });
            } else {
                var oldService = services[0];
                oldService.update(source, service_data, function(error) {
                    callback(error, oldService);
                });
            }
        }
    });
}

module.exports = mongoose.model('Service', ServiceSchema);