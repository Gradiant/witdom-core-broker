var request = require('superagent');
var fs = require('fs');
var config = require('./config');

var options = {
    //key: fs.readFileSync(config.https.broker_key),
    key: fs.readFileSync('CAs/witdomCA/client1_key.pem'), 
    passphrase: config.https.broker_key_passphrase,
    //cert: fs.readFileSync(config.https.broker_cert),
    cert: fs.readFileSync('CAs/witdomCA/client1_crt.pem'), 
    ca: fs.readFileSync(config.https.ca_cert),
};

//console.log(config);

//var broker_ed = request.agent("https://" + config.broker_ed.domain_name + ":" + config.broker_ed.https_port +"/v1", options);
var broker_ed = request.agent(options);

var url_prefix = "https://" + config.broker_ed.domain_name + ":" + config.broker_ed.https_port +"/v1";
console.log(options);
console.log(url_prefix);

broker_ed.get(url_prefix + '/service/domainlist').end(function(error, response) {
    if (error) {
        console.log("error: " + error);
    } else {
        console.log(response.body);
    }
});