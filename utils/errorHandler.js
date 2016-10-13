// global error handler
function globalHandler(error, request, response, next) {
    console.log(error);
    if (error.code == 'SCHEMA_VALIDATION_FAILED') {
        response.writeHead(400);
        response.end(JSON.stringify({message: error.results.errors}));
    } else if(error.status == 400) {
        response.writeHead(400);
        response.end(JSON.stringify({message: [{code:"400",message:"Invalid JSON body","path":[]}]}));
    }
}

module.exports = globalHandler;