# Contents of the WITDOM Broker core component repository

## Directory listing
The broker repository contains the followin directories and files
 - api
   - swagger.yaml (Api specification in swagger format)
 - config (broker configuration)
 - controllers (nodejs controllers for servicing request to the broker)
 - tests (nodejs tests and java api client library with example calls)
   - nodejs
   - java
 - CAs (several self-signed CAs (along signed server and client certificates) created with testing purposes)
 - utils (nodejs server handlers)
 - broker.js
 - Dockerfile
 - package.json
 - README.md (this file)


## Broker configuration
WITDOM broker component uses JSON style configurariton files. The default configuration is inside 'config/default.js', a custom configuration can be entered by providing the desired fields in the file 'config/custom.js'.

## Local deployment of the broker with nodejs
For locally deploying the broker just run the following command:
```
$ npm start
```

It will install all the needed dependencies and start the broker. 

## Deployment of the broker with Dockerfile
First build the docker image
```
$ docker build -t witdom-core-broker .
```

Then run the docker container
```
$ docker run -name broker -p 5000:5000 -p 5043:5043 -d witdom-core-broker
```

To stop the container
```
$ docker stop broker
```

To start the container again
```
$ docker start broker
```

To fresh start the container from the image first run (with the container stopped)
```
$ docker rm broker
```

And then run it again with the 'docker run' command

Prior building the docker image it is possible to change the default configuration of the broker by editing the file 'config/custom.js'.
For example to change the port of the HTTP connector put the following content in the file:

```javascript
module.exports = {
    http: { port: 5000 }
};
```
If the default port configuration is changed it has to be updated also in the Dockerfile

```
EXPOSE <http_port>
EXPOSE <https_port>
```

And also change the command for running the docker container as follows:
```
$ docker run -name broker -p <http_port>:<http_port> -p <https_port>:<https_port> -d witdom-core-broker
```


## Launching nodejs unit tests

### Broker deployed locally
Prior to launching the tests the HTTP and HTTPS ports must be configured if the default ports have been changed in the running broker. To do this edit the file 'tests/config/custom.js' with the following content, changing the ports to the right values:

```javascript
module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
    }
};
```
These test also check the functionality of mutual identification with client and server certificates. The CA and client certs to use in the tests can also be configured in the file 'tests/config/custom.js' like this:

```javascript
module.exports = {
    https: {
        ca_cert: 'witdomCA/witdomcacert.pem' // The CA certificate used to verify the server certificate
        right_client_key: 'witdomCA/client1_key.pem', // The key of valid client in the CA
        right_client_cert: 'witdomCA/client1_crt.pem', // The certificate of a valid client in the CA
        wrong_client_key: 'untrustedCA/untrusted_client_key.pem', // The key of an invalid client in CA
        wrong_client_cert: 'untrustedCA/untrusted_client_crt.pem', // The certificate of a invalid client in the CA
    }
};
``` 
The library used to do the tests ('supertest') doesn't support the configuration of client certificates yet but it will in the next library release as is stated [here](https://github.com/visionmedia/supertest/pull/373).
In the mean time the library can be patched by editing the file 'lib/agent.js' according to what is explained in the link so the mutual identification tests pass.

To launch the tests just run the following command:
```
$ npm test
```

### Broker deployed in Docker containter

TBD

## Launching java API tests

TBD





# Things to put elsewhere

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
