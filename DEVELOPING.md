## Adding a CA cert to supertest

Use the following code:

```javascript
var supertest = require("supertest");
var server = supertest.agent("https://localhost:5043/v1", {ca: fs.readFileSync('path/to/CA_cert')})
```

## Adding a client cert to supertest (for identifying against the server)

```javascript
var supertest = require("supertest");
var server = supertest.agent("https://localhost:5043/v1", {key: fs.readFileSync('path/to/Client_key'),cert: fs.readFileSync('path/to/Client_cert')})
```


Currently supertest doesn't support this feature, so the file 'lib/agent.js' of supertest lib must be modified according to this [pull request](https://github.com/visionmedia/supertest/pull/373/files)
