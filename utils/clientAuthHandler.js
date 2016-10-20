//var get_ip = require('ipware')().get_ip;
var includes = require('array-includes');

// Requests from Apps don't need a client certificate
// A handler for client authorization
// Requests from internal services need a client certificate
function clientAuthHandler(request, response, next) {
    //var ip_info = get_ip(request);
    //console.log(ip_info);

    if (request.clientIp.indexOf('::ffff:') !== -1) {
        request.clientIp = request.clientIp.substring(7);

    }

    console.log(request.clientIp);

    var internalIPServices = ['127.0.0.1']; //Here add a list of ips of the deployed internal services (also the untrested broker)

    if (!request.client.authorized) {
        console.log(includes(internalIPServices,request.clientIp));
        //if (internalIPServices.indexOf(request.clientIp) != -1) { 
        if (includes(internalIPServices,request.clientIp)) { // An internal server must be authorized by its client cert
            //request.client.
            response.writeHead(401, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({'status':'denied'}));
            return;
        }
    }
    next();
}

module.exports = clientAuthHandler;