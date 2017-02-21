var watcher = require('./request/requestWatcherDummy');

watcher.addRequest("1", "response");
watcher.addRequest("6", "response");
watcher.addRequest("8", "response");

var elements = ["1", "6", "8"];
var indexToRemove = 0;

var id = setInterval(function() {
    console.log('soy el timeout');
    if (indexToRemove == elements.length) {
        //clearInterval(id);
        indexToRemove++;
    } else if (indexToRemove > elements.length) {
        watcher.addRequest(elements[indexToRemove-elements.length-1], "response");
        indexToRemove++;
        if (indexToRemove == (2*elements.length+1)) {
            indexToRemove = 0;
        }
    } else {
        console.log('removing element ' + elements[indexToRemove]);
        watcher.removeRequest(elements[indexToRemove]);
        indexToRemove++;
    }
    
}, 2000);