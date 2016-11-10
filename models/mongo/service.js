var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ServiceSchema = new Schema({
    _id: String,
    host_data: Object
},
{ _id: false },
{ timestamps: true}); // adds createdAt and updatedAt fields

ServiceSchema.methods.update = function update(host_data, callback) {
    this.host_data = host_data;
    this.markModified('host_data');
    this.save(function(error) {
        callback(error);
    });
};

ServiceSchema.statics.saveOrUpdate = function saveOrUpdate(name, host_data, callback) {
    var Service = mongoose.model('Service', ServiceSchema);
    var service = new Service({_id: name, host_data: host_data});
    service.save(function(error, savedService) {
        if(error) {
            if(error.code == 11000) { // 11000 error means that the object already exists
                Service.findById(name, function(error, oldService) {
                    if(error) {
                        callback(error, null);
                    } else {
                        // Update ship data
                        oldService.update(host_data, function(error) {
                            callback(error, service);
                        });
                    }
                });
            } else {
                callback(error);
            }
        } else {
            callback(error, savedService);
        }
    });
}

module.exports = mongoose.model('Service', ServiceSchema);