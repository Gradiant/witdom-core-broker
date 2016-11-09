var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RequestSchema = new Schema({
    user_id: String,
    status: String,
    requests_log: [{}]
},
{ timestamps: true}); // adds createdAt and updatedAt fields

RequestSchema.methods.update = function update(status, requests_log, callback) {
    this.status = status;
    this.markModified('status');
    this.requests_log = requests_log;
    this.markModified('requests_log');
    this.date = Date.now;
    this.markModified('date');
    this.save(function(error) {
        callback(error);
    });
};

RequestSchema.methods.updateStatus = function update(status, callback) {
    this.status = status;
    this.markModified('status');
    this.date = Date.now;
    this.markModified('date');
    this.save(function(error) {
        callback(error);
    });
};

RequestSchema.methods.updateLog = function update(log, callback) {
    this.requests_log = log;
    this.markModified('requests_log');
    this.date = Date.now;
    this.markModified('date');
    this.save(function(error) {
        callback(error);
    });
};

module.exports = mongoose.model('Request', RequestSchema);