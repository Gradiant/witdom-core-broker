

/**
 * Class for checking the state of blocking requests and reply to them when the requests are finished
 */
function RequestWatcher() {
    this.requests = [];
    //this.intervalId;
    this.timeoutId;
    this.intervalLength = 500;
}

function checkRequests() {
    // Process requests
    console.log("Checking the requests");

    // Re-set the timeout
    if (this.requests.length > 0) {
        console.log("There are "+this.requests.length+" request left. Re-setting the timeout");
        this.requestId = setTimeout(checkRequests.bind(this), this.intervalLength);
    }
}

RequestWatcher.prototype.addRequest = function(requestId, requestResponse) {
    this.requests.push({requestId:requestId,requestResponse:requestResponse});

    console.log("There are "+this.requests.length+" requests");
    if (this.requests.length == 1) {
        /*this.invervalId = setInterval(function() {

        }, this.intervalLength);*/
        console.log("Only 1 request, setting the timeout");
        this.timeoutId = setTimeout(checkRequests.bind(this), this.intervalLength);
    } else {
        console.log("More than one request, timeout must be active");
    }
}

RequestWatcher.prototype.removeRequest = function(requestId) {
    this.requests.slice().reverse().forEach(function (element, index, array) {
        console.log("####Checking the element with index "+index+", provided requestId:"+requestId+", element: "+JSON.stringify(element));
        if (element.requestId == requestId) { // If we found the element we delete it
            console.log("Removing element with index " + index);
            this.requests.splice(array.length - 1 - index, 1);
            //array.splice(index, 1);
        }
    }, this);
}

var requestWatcher = module.exports = exports = new RequestWatcher;