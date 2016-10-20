// global error handler
function globalHandler(error, request, response, next) {
    //console.log(error);
    if (error.failedValidation) {
        response.setHeader('Content-Type', 'application/json');
        response.writeHead(400);
        response.end(JSON.stringify({message: error.Error}));
    } else if(error.status == 404) {
        response.setHeader('Content-Type', 'application/json');
        response.writeHead(404);
        response.end(JSON.stringify({message: [{code:"404",message:"Can not GET","path":[]}]}));
    }
}

module.exports = globalHandler;