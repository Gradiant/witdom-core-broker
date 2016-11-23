var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * mongoose Schema
 * user_id: id of the user who started the request (what TODO if a certificate is present)
 * status: current status of the request (TODO define status types)
 * requests_log: array with all the request/response data got during the request process in json format
 */
var RequestSchema = new Schema({
    user_id: String,
    status: String,
    requests_log: [{}]
},
{ timestamps: true}); // adds createdAt and updatedAt fields

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