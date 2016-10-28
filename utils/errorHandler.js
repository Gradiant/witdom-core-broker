// global error handler
function globalHandler(error, request, response, next) {
    //console.log(error.message);
    if(error.name == 'BrokerError') {
        switch (error.reason) {
            case 'INVALID_CERTIFICATE' : 
                response.setHeader('Content-Type', 'application/json');
                response.writeHead(401);
                if (request.client.hasCert) {
                    var err_message = "Authorization failed: wrong certificate provided"; 
                } else {
                    var err_message = "Authorization failed: a client certificate is needed";
                }
                response.end(JSON.stringify({
                    message: [{
                        code:"401",
                        status:'denied',
                        //message:"Authorization failed: must provide valid certificate",
                        message:err_message,
                        path:[request._parsedUrl.pathname]
                    }]
                }));
                
                break;
            case 'INVALID_CERTIFICATE_OR_TOKEN' :
                response.setHeader('Content-Type', 'application/json');
                response.writeHead(401);
                if (request.client.hasCert) {
                    if ((request.swagger.params.user.value == undefined) && (request.swagger.params.token.value == undefined)) {
                        var err_message = "Authorization failed: wrong certificate provided";
                    } else {
                        var err_message = "Authorization failed: wrong certificate and token provided";
                    }
                } else {
                    if ((request.swagger.params.user.value == undefined) && (request.swagger.params.token.value == undefined)) {
                        var err_message = "Authorization failed: a client certificate or user token is needed";
                    } else {
                        var err_message = "Authorization failed: no certificate provided and wrong user token";
                    }
                    
                }
                response.end(JSON.stringify({
                    message: [{
                        code:"401",
                        status:'denied',
                        message:err_message,
                        //message:"Authorization failed: must provide valid certificate or correct user token",
                        path:[request._parsedUrl.pathname]
                    }]
                }));
                break;
            default:
                response.setHeader('Content-Type', 'application/json');
                response.writeHead(500);
                response.end(JSON.stringify({
                    message: [{
                        code:"500",
                        status:'unknown error',
                        message:"unknown error",
                        path:[request._parsedUrl.pathname]
                    }]
                }));
                break;
        }
    } else {
        if(error.failedValidation) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(400);
            response.end(JSON.stringify({
                message: error.Error
            }));
        } else if(error.status == 404) {
            response.setHeader('Content-Type', 'application/json');
            response.writeHead(404);
            response.end(JSON.stringify({
                message: [{
                    code:"404",
                    message:"Cannot GET",
                    path:[request._parsedUrl.pathname]
                }]
            }));
        }
    }
    next();
}

module.exports = globalHandler;