var requestForwardingHandler = require('../request_forwarding/requestForwardingHandler');
var stream = require('stream');

/**
 * Class for checking the state of blocking requests and reply to them when the requests are finished
 */
function RequestWatcher() {
    this.requests = [];
    //this.intervalId;
    this.timeoutId;
    this.intervalLength = 500;
}

function checkRequest(requests, theindex, toDelete, watcher) {
    /*if (__logger) {
        __logger.silly("------------------------------------");
    }*/
    if (theindex >= requests.length) { // request array completely processed
        toDelete.reverse().forEach(function (element) {
            watcher.requests.splice(element, 1);
        });
        if (watcher.requests.length > 0) {
            watcher.timeoutId = setTimeout(checkRequests.bind(watcher), watcher.intervalLength);
        }
    } else {
        var therequest = requests[theindex];
        if (__logger) {
            __logger.info("Checking status of request " + therequest.requestId);
        }
        requestForwardingHandler.getRequest(therequest.requestId, function(error, request) {
            if(error || !request) {
                if (__logger) {
                    __logger.info("Error getting the status of the request " + therequest.requestId);
                }
                // Request maybe no longer exists, ??delete it??
                // toDelete.push(theindex);
                theindex=theindex+1;
                checkRequest(requests, theindex, toDelete, watcher);
            } else {
                // Got request
                if(request.status == 'FINISHED') {
                    var response_object = therequest.requestResponse;
                    if (__logger) {
                        __logger.info("The status is FINISHED");
                    }
                    // Request is already finished
                    var response_data = request.request_log[request.request_log.length - 1];
                    var response_body = response_data.response.body || {};
                    var response_headers = response_data.response.headers || {};
                    var response_status = response_data.response.status;
                    // Set headers
                    var keys = Object.keys(response_headers);
                    for(var index in keys) {
                        if (keys[index].toLowerCase() === "content-length") {//Skip content-length header because it may be different from the original if the json serialization uses different tabulation
                            continue;
                        }
                        /*if (__logger) {
                            __logger.info("Setting header: " + keys[index]);
                        }*/
                        response_object.setHeader(keys[index], response_headers[keys[index]]);
                    }
                    // Set status
                    response_object.writeHead(response_status);
                    // Send body
                    if((response_body instanceof stream.Stream) || (response_body instanceof Buffer) || (typeof(response_body) == 'string')) {
                        // Writable body
                        if (__logger) {
                            //__logger.info("Writable body");
                            __logger.info(response_body);
                        }
                        response_object.end(response_body);
                    } else {
                        // Serializable body
                        if (__logger) {
                            //__logger.info("Serializable body");
                            //__logger.info(response_body);
                            //__logger.info(JSON.stringify(response_body));
                        }
                        response_object.end(JSON.stringify(response_body));
                    }
                    requestForwardingHandler.deleteRequest(therequest.requestId, function(error){});
                    toDelete.push(theindex);
                    theindex=theindex+1;
                    checkRequest(requests, theindex, toDelete, watcher);
                } else {
                    if (__logger) {
                        __logger.info("The status is " + request.status);
                    }
                    theindex=theindex+1;
                    checkRequest(requests, theindex, toDelete, watcher);
                }
            }
        });
    }
}

function checkRequests() {
    // Process requests
    if (__logger) {
        __logger.info("Checking the requests");
    }
    var index = 0;
    checkRequest(this.requests, index, [], this);
}

RequestWatcher.prototype.addRequest = function(requestId, requestResponse) {
    this.requests.push({requestId:requestId,requestResponse:requestResponse});
    if (__logger) {
        __logger.info("Added request " + requestId + " to the requestWatcher");
        //__logger.silly("There are "+this.requests.length+" requests");
    }
    if (this.requests.length == 1) {
        /*this.invervalId = setInterval(function() {

        }, this.intervalLength);*/
        if (__logger) {
            __logger.silly("Only 1 request, setting the timeout");
        }
        this.timeoutId = setTimeout(checkRequests.bind(this), this.intervalLength);
    } else {
        if (__logger) {
            __logger.silly("More than one request, timeout must be active");
        }
    }
}

/*RequestWatcher.prototype.removeRequest = function(requestId) {
    this.requests.forEach(function (element, index, array) {
        if (element.requestId == requestId) { // If we found the element we delete it
            array.splice(index, 1);
        }
    }, this);
}*/

var requestWatcher = module.exports = exports = new RequestWatcher;