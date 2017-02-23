var request = require('superagent');
var fs = require('fs');
//var config = require('./config');

var config = {
    broker_ed: {
        domain_name: "broker-td",
        https_port: 5043
        //domain_name: "broker-ud",
        //https_port: 5143
    },
    https: {
        key: 'CAs/udCA/client_ud_key.pem',
        cert: 'CAs/udCA/client_ud_crt.pem',
        ca_cert: 'certs/tdcacert.pem'
        //ca_cert: 'certs/udcacert.pem'
    }
}

var options = {
    key: fs.readFileSync(config.https.key), 
    //passphrase: config.https.key_passphrase,
    cert: fs.readFileSync(config.https.cert), 
    ca: [fs.readFileSync(config.https.ca_cert)]
};

//console.log(config);

//var broker_ed = request.agent("https://" + config.broker_ed.domain_name + ":" + config.broker_ed.https_port +"/v1", options);
var broker_ed = request.agent(options);

var url_prefix = "https://" + config.broker_ed.domain_name + ":" + config.broker_ed.https_port +"/v1";
//console.log(options);
console.log(url_prefix);

broker_ed.get(url_prefix + '/service/domainlist').end(function(error, response) {
    if (error) {
        console.log("error: " + error);
    } else {
        console.log(response.body);
    }
});
