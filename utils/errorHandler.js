// global error handler
function globalHandler(error, request, response, next) {
    //console.log(error.message);
    if(error.name == 'BrokerError') {
        switch (error.reason) {
            case 'INVALID_CERTIFICATE' : 
                response.setHeader('Content-Type', 'application/json');
                response.writeHead(401);
                response.end(JSON.stringify({
                    message: [{
                        code:"401",
                        status:'denied',
                        message:"Authorization failed: must provide valid certificate",
                        path:[request._parsedUrl.pathname]
                    }]
                }));
                break;
            case 'INVALID_CERTIFICATE_OR_TOKEN' :
                response.setHeader('Content-Type', 'application/json');
                response.writeHead(401);
                response.end(JSON.stringify({
                    message: [{
                        code:"401",
                        status:'denied',
                        message:"Authorization failed: must provide valid certificate or correct user token",
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
                    message:"Can not GET",
                    path:[request._parsedUrl.pathname]
                }]
            }));
        }
    }
    next();
}

module.exports = globalHandler;