# Contents of the WITDOM Broker core component repository

## Directory listing
The broker repository contains the following directories and files (not all the files in subdirectories are listed):
 - api
   - swagger.yaml (Api specification in swagger format)
 - blueprints (directory with blueprint prototypes for deploying the trusted and untrusted brokers with some dummy services)
 - CAs (several self-signed CAs (along with signed server and client certificates) created with testing purposes, and also instructions to create new ones)
 - certs (server and ca certificates for testing)
 - config (broker configuration)
 - controllers (nodejs controllers for servicing request to the broker)
 - dependencies (this directory is a git submodule that clones the IAM repository for access the IAM javascript client module)
 - env (contains ENV files used by docker-compose to configure containers at startup)
 - models (mongoose database models)
 - orchestration (default cloud orchestration connection modules)
 - protection (default protection orchestrator communication module and dummy module)
 - request (contains a module for doing rest calls and a watcher of the active broker calls)
 - request_forwarding (modules for handling broker's core functionality)
 - service_info (an utility module to retrieve info about available services and also a mock module)
 - tests (nodejs tests and java api client library with example calls)
   - nodejs
   - java
 - utils (nodejs server handlers)
 - validators (this directory contains 'dummyTokenValidation' that serves as an example on how to create a module to connect to a different token validation service)
 - broker.js
 - config_and_start.sh (script that generates a custom config file from ENV vars and launch the Broker using that config file. It's used by the Docker container)
 - docker-compose.yml (Dockercompose yaml file used for creating and launching the needed containers for TD and UD Brokers)
 - docker-componse-workflow-test.yml (Same as above file but it also launches the dummy services PO, service_td and service_ud)
 - Dockerfile
 - package.json
 - README.md (this file)
 - workflow_test.sh (script)
 - workflow_test_https.sh


## Broker configuration
WITDOM broker component uses JSON style configurariton files. The default configuration is inside 'config/default.js', a custom configuration can be entered by providing the desired fields in the file 'config/custom.js'.

It is also possible to use the script `config_and_start.sh` that uses ENV variables to generate a custom config file and then starts the Broker with that custom configuration file. This is the method used by the Docker image to configure the Broker when it is started. This ENV variables can be passed to Docker through an ENV file.

Below the different configuration options are described, and after that the structure of the ENV file that can be passed to Docker is shown.

### Database
The database must be up and running before launching the broker. By default it points to 'mongo:27017', as this is the way it works on docker by linking containers. You can enter different configuration in the 'config/custom.js' file.
```json
database: {
    host: 'mongo',
    port: '27017'
}
```

### Orchestration
There are two included orchestration modules, one for Cloudify and other mock for using in testing/integration environments where there isn't a Cloudify available.

#### To load the mock_example module:
```json
    orchestrator: {
        name: 'mock_example',
        config: {
            services: {
                service1: {
                    host: "host1",
                    port: "port1"
                },
                service2: {
                    host: "host2",
                    port: "port2"
                }
            }
        }
    }
```
The module will create a service for each one defined inside 'services' element, and will use the host and port defined to construct the URI returned in a call to /service/details. For the remaining parameters returned by that method, 'service_id' will be set to the given id in the mock_example configuration and image and description will have always the same value because they aren't needed for test environments.

#### To load the one which communicates with Cloudify
```json
    orchestrator: {
        name: 'cloudify_provider_connector',                    // Installed module name to import
        config: {
            protocol: 'http',                                   // Connection protocol
            host: 'localhost',                                  // Cloudify API host
            port: '1234'                                        // Cloudify API port
        }
    }
```

This module looks for outputs in all cloudify deployments. In orded to be recognized, the outputs in the cloudify blueprint must be defined in this format.
```yaml
outputs:
  service-name:
    value:
      description: Description of the service
      host: {get_attribute: [example_node, service-name_ip_address]}
      port: {get_attribute: [example_node, service-name_internal_port]}
      image: {get_attribute: [example_node, service_image_url]}
      name: {get_attribute: [example_node, service-name_name]}
```

### Other configuration parameters

```json
{
    protocol: "https",                                          // Protocol used by the Broker to connect to other services/components
    http: { port: 5000 },                                       // HTTP port where the Broker listens
    https: {
        port: 5043,                                             // HTTPS port where the Broker listens
        broker_key: 'certs/broker_key.pem',                     // Broker private key
        broker_key_passphrase: <the_passphrase>,                // Passphare to decrypt the private key (only if it's encrypted)
        broker_cert: 'certs/broker_td_crt.pem',                 // Broker certificate
        ca_certs: ['certs/tdcacert.pem', 'certs/udcacert.pem']  // Certification authorities used by the Broker to validate certificates
    },
    testing: true,                                              // If it is set to true the Broker allows connections through HTTP (should only be used for testing purposes) and doesn't validate the tokens
    numberOfRetries: 10,                                        // Number of times to retry the connection with a service/component if it's not responding
    po_id: 'po',                                                // ID given to the PO by Cloudify at deployment time
    po_cn: 'po',                                                // Common Name of the PO expected to be received in its client certificate, used to skip the calls to PO when the PO is the service making calls to the untrusted domain 
    po_basepath: '/v1',                                         // Base path of the PO URL
    broker_ed : { //broker external domain
        domain_name: "broker-ud",                               // Hostname of the external domain Broker
        http: {
            port: 5100                                          // HTTP port of the external domain Broker
        },
        https: {
            port: 5143                                          // HTTPS port of the external domain Broker
        },
        http_port: 5100,
        https_port: 5143
    },
    tokenValidationService: {                                   // Configuration of the IAM module
        admin: {
            user: "admin",
            pass: "adminpw"
        },
        endpoint: "http://127.0.0.1:5001/v3"
    },
    tokenValidationModule: "openstack-token-utils",             // Token validation module used to validate user tokens. 'validators/dummyTokenValidation' can be used for testing environments where an IAM is not deployed
    audit: {                                                    // Audit component configuration
        active: 'true',                                         // Whether or not use the audit component ('true'|'false')
        database: {                                             // Mongo database configuration
            host: 'mongo',
            port: '27017'
        }
    }
}
```

### Configuration ENV file

```
BROKER_HTTP_PORT=5000                       # HTTP port of the Broker inside the container
BROKER_HTTPS_PORT=5043                      # HTTPS port of the Broker inside the container
BROKER_CERT=certs/broker_td_crt.pem         # TLS certificate of the Broker
BROKER_KEY=certs/broker_td_key.pem          # Key of the certificate
BROKER_KEY_PASSPHRASE=Gr4d14ntBr0k3r        # Passphrase of the key (in case it's encrypted)
CA_CERTS=certs/tdcacert.pem                 # Certificates of the CAs that provided the certificates of the WITDOM services (more than one CA can be provided using the ',' as separator, for example for using differnet CAs for the trusted and untrusted domains)
PROTOCOL=http                               # Protocol used by the Broker to communicate with other components (http|http)
BROKER_ED_HOST=broker-ud                    # Host name of the Broker in the external domain (For the TD Broker this will be the hostname of the UD Broker and vice versa)
BROKER_ED_HTTP_PORT=5000                    # HTTP port of the Broker in the external domain
BROKER_ED_HTTPS_PORT=5043                   # HTTPS port of the Broker in the external domain
IAM_HOST=iam                                # Host name of the IAM service
IAM_PORT=5000                               # Port of the IAM
IAM_PROTOCOL=http                           # Protocol to use to connect to the IAM
IAM_ADMIN_USER=admin                        # Admin user of the IAM
IAM_ADMIN_PASSWORD=adminpw                  # Admin user password of the IAM
MONGO_HOST=mongo                            # Hostname of the mongo engine used by this Broker instance
MONGO_PORT=27017                            # Port of the mongo engine
AUDIT_ACTIVE=true                           # Whether or not use the audit component
AUDIT_MONGO_HOST=mongo                      # Mongo host for the audit component
AUDIT_MONGO_PORT=27017                      # Mongo port for the audit component
ORCHESTRATOR=mock_example                   # Module used for communicate with the orchestrator (cloudify_provider_connector|mock_example)
MOCK_SERVICES=po:{host:"po",port:"8080"}    # List of services in JSON format to configure in the 'mock_example' module
CLOUDIFY_HOST=cloudify                      # Hostname of Cloudify (only for module 'cloudify_provider_connector')
CLOUDIFY_PORT=80                            # Port of Cloudify (only for module 'cloudify_provider_connector')
RETRIES=8                                   # Number of retries to do when there is a network error when communicating with other components
PO_ID=po                                    # ID of the PO defined in the cloud orchestrator
PO_CN=po                                    # Common Name expected to be received in the client certificate of the PO
PO_BASEPATH=/v1                             # Basepath of the PO URL
LOGGING_LEVEL=silly                         # Logging level (error|warn|info|verbose|debug|silly)
```

## Auditing

The Broker uses the npm module 'audit-log' to save auditing logs of all requests that the Broker receives. The logged information of each request is saved in a mongo database and its format is the following:

```
    - actor: The token provided in the request in the header 'X-Auth-Token'.
    - origin: If the requester provides a valid client certificate, the certificate subject is stored here.
    - action: HTTP method, POST|GET.
    - label: Request URI.
    - object: Request headers.
    - description: Request body.
```

## Building IAM docker image and launching container

The directory `dependencies/iam` contains a link to the IAM repository as a submodule. After cloning the Broker repository run the following commands to download the IAM repository code.
```bash
$ git submodule init
$ git submodule update
```

Then run the following commands to build the IAM image
```
$ cd dependencies/iam/keystone/docker
$ docker build -t iam .
$ cd -
```

Once the docker image is built the container can be launched with the following command:
```bash
$ docker run -it -name iam -p 5001:5000 iam
```


## Local deployment of the broker with nodejs
For locally deploying the broker just run the following command:
```bash
$ npm start
```

It will install all the needed dependencies and start the broker with the configuration inside the config directory. It is also posible to provide a custom config when starting the Broker using the following command:
```bash
$ nmp start -- custom_config.js
```
This will start the broker using the contents of the file `custom_config.js` to override the default configuration. Two files are provided for running 2 instances of the Broker (TD and UD) using a local installation of nodejs. The files are `td_custom.js` and `ud_custom.js`. When using these two files for running both Brokers it is also necessary to add the following lines to the file `/etc/hosts` so the Brokers can see each other.
```
127.0.0.1 broker-td
127.0.0.1 broker-ud
```
Also the TD broker needs a mongo server listening in the port 27017 and the UD broker a mongo server in the port 27018. An IAM listening at the port 5001 is also needed.

## Deployment of the broker with Dockerfile
The provided Dockerfile creates a Docker image that can be configured when the container is run through an ENV file. The same image can be used to deploy the Broker for the trusted and the untrusted domain. Two ENV files are provided, one for each domain, `env/td.env` and `env/ud.env`.

It's not recommended to change the value of 'BROKER_HTTP_PORT' and 'BROKER_HTTPS_PORT' because the default values are hardcoded in 'Dockerfile', for this reason if any of those values are changed the 'Dockerfile' has also to be changed accordingly and the docker image has to be rebuilt.

To build the Docker image run the following Docker command:

```bash
$ docker build -t witdom-core-broker .
```

It will build the image and tag it with the tag `witdom-core-broker`. Once the image is built the container can be run, but it needs an available mongo container first. To run a mongo container run the following command:

```bash
$ docker run --name mongo-broker -p 27017:27017 -d mongo
```

After this run the following command to run the Broker container using the configuration from the file `config.env`:

```bash
$ docker run --name broker --env-file config.env -p 5000:5000 -p 5043:5043 --link mongo-container-name:mongo -d witdom-core-broker
```

It's also possible to run the Broker container using docker-compose. A docker-compose file ('docker-compose-one-image.yml') is provided in order to launch a testing environment using the image that is built from Dockerfile', this environment launches two Broker containers (TD and UD) along with a mongo container for each one and an IAM container. The configuration used in each Broker is contained in the files `td.env` and `ud.env`. With this docker-compose file there is no need to build the Broker image because docker-compose will handle it.

To build the images and run the containers use the following commands:

```bash
$ docker-compose build  # Builds images
$ docker-compose up     # Creates and starts containers
```

And to stop and remove them:
```bash
$ docker-compose down
```


## Launching nodejs integration tests

### Broker deployed locally
Prior to launching the tests the HTTP and HTTPS ports must be configured if the default ports have been changed in the running broker. To do this edit the file `tests/nodejs/integration/config/custom.js` with the following content, changing the ports to the right values:

```javascript
module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
    }
};
```
These tests also check the functionality of mutual authentication with client and server certificates. The CA and client certs to use in the tests can also be configured in the file `tests/nodejs/integration/config/custom.js` this way:

```javascript
module.exports = {
    https: {
        ca_cert: 'CAs/tdCA/tdcacert.pem', // The CA certificate used to verify the server certificate
        right_client_key: 'CAs/tdCA/client_td_key.pem', // The key of valid client in the CA
        right_client_cert: 'CAs/tdCA/client_td_crt.pem', // The certificate of a valid client in the CA
        wrong_client_key: 'CAs/untrustedCA/untrusted_client_key.pem', // The key of an invalid client in CA
        wrong_client_cert: 'CAs/untrustedCA/untrusted_client_crt.pem' // The certificate of a invalid client in the CA
    }
};
``` 

The provided Broker certificate has `broker-td` for common name, for this reason the HTTPS tests must connect to that hostname so the tests can validate the server certificate. Add the following line to `/etc/hosts` to be able to access the Broker deployed at localhost with `broker-td` as hostname.
```
127.0.0.1 broker-td
```

To launch the tests just run the following command:
```
$ npm test
```

If you don't want to run the tests that use the HTTPS endpoint just run:
```
$ npm run api_test
```

### Broker deployed in Docker container

To launch the nodejs tests using the Brokers in the docker containers use the same procedure as in the locally deployed broker, that is, change the default test configuration in `tests/nodejs/integration/config/custom.js` and run the command:
```
$ npm test
``` 

## Launching nodejs unit tests
The unit tests don't need a running instance of the Broker, but some of them need an instance of the IAM and mongo. With the default configuration the IAM must be listening in the port 5001 and the mongo in the port 27017.
The unit tests available are the following:
```bash
$ npm run db_test                   # database tests (needs mongo)
$ npm run token_test                # IAM and dummy token validation modules tests (needs IAM)
$ npm run si_test                   # ServiceInfo module tests (needs mongo)
$ npm run mocksi_test               # MockServiceInfo module tests
$ npm run forwardingHandler_test    # forwardingHandler module tests (needs mongo)
$ npm run requestHandler_test       # requestHandler module tests (needs mongo)
$ npm run restHandler_test          # restHandler module tests (needs mongo)
```

## Launching java API tests

The Java tests are inside the directory tests/java. This directory contains a maven script 'pom.xml' that can be used to compile and package the API client library and to run the example tests.
Apache maven 3.3.3 or greater is needed to build the API client library and run the tests.
To build the API client library run the following command:
```
$ mvn package
```
This will generate the files `swagger-java-client-1.0.0.jar` and `swagger-java-client-1.0.0-tests.jar`. The first file contains the API client library and the second one contains the API client tests that serve as an example of how invoke the broker REST API using the API client library.
The test classes are contained in `tests/java/src/test/java/eu/witdom/core/broker/client/api/`, there are 4 test classes, `HTTPSApiTest.java`, `ForwardApiTest.java`, `RequestApiTest.java` and `ServicesApiTest.java`. The first one makes the request to the broker API using HTTPS and the rest use HTTP.

### Trust store creation
For validating the server certificate (if it is an autogenerated self-signed certificate) we need to create a trust store and import in the server certificate. To do this run the following command:
```
$ keytool -import -alias <alias_of_ca_cert> -file <ca_cert_file> -keystore <trust_store_name>
```
A prompt will appear requesting a password for the new trust store.
After creating the trust store it can be used passing the following arguments to the JVM when invoking it:
```
-Djavax.net.ssl.trustStore=<path/to/truststorefile> -Djavax.net.ssl.trustStorePassword=<truststorepassword>
```
It is also possible to set this parameters in Java code before creating the first instance of the class `ApiClient` (each of the API classes, `ForwardApi`, `RequestApi` and `ServiceApi`, use this class internally):
```java
System.setProperty("javax.net.ssl.trustStore",path_to_truststore);
System.setProperty("javax.net.ssl.trustStorePassword",truststorepassword);
```

### Key store creation
For the mutual authentication a client certificate must be provided to the broker along the request. This certificate is read by a Java application from the selected key store. The java 'keytool' command can't be used to directly create this key store because it doesn't allow to import a key when generating the key store, the only option is to create a new key along the key store creation. So the openssl tool is used to create the new key store in PKCS12 format and to import into it the client key and certificate. First the client key and the client certificate must be concatenated in one file:
```
$ cat <client_key_file> <client_crt_file> > client_key_crt.pem
```
After that to create the PKCS12 key store use the following command:
```
$ openssl pkcs12 -export -in client_key_crt.pem -out client_keystore.pkcs12 -name client -noiter -nomaciter
```
Where `-name client` indicates an alias for the key_cert inside the key store. After executing this command a prompt requesting a password for the key store will appear. After creating the key store it can be converted from PKCS12 to JKS format with the following command:
```
$ keytool -importkeystore -deststorepass <password_of_jks_keystore> -destkeypass <password_of_the_key_in_jks> -destkeystore <jks_file> -srckeystore <pkcs12_file> -srcstoretype PKCS12 -srcstorepass <pkcs12_password> -alias client
```
Use the same password for `-deststorepass`  and `-destkeypass`, and for `-alias` use the same value as in `-name` for the 'openssl' command. To use the created key store in a Java application the JVM must be invoked with the following params for the case of the PKCS12 format:
```
$ -Djavax.net.ssl.keyStore=<path/to/keystorefile.pkcs12> -Djavax.net.ssl.keyStorePassword=<keystorepassword> -Djavax.net.ssl.keyStoreType=PKCS12
```
And for the case of JKS format:
```
$ -Djavax.net.ssl.keyStore=<path/to/keystorefile.jks> -Djavax.net.ssl.keyStorePassword=<keystorepassword>
```
Again, it is also possible to set this parameters in Java code before creating the first instance of the class `ApiClient`:
```java
System.setProperty("javax.net.ssl.keyStore",path_to_keystore);
System.setProperty("javax.net.ssl.keyStorePassword",keystorepassword);
System.setProperty("javax.net.ssl.keyStoreType",type_of_keystore);  //Possible values 'JKS' or 'PKCS12'
```

A preconfigured truststore is provided in the file `tests/java/truststore/truststore.jks`, and two keystores (both in PKCS12 and JKS format) in the files `tests/java/keystore/client_td_keystore.pkcs12`, `tests/java/keystore/client_td_keystore.jks`, `tests/java/keystore/untrusted_client_keystore.pkcs12` and `tests/java/keystore/untrusted_client_keystore.jks`. The password for the trust store and the key stores is `Gr4d14nt`. The alias of the certificate in the `client_td_keystore` is `client_td`, and in the `untrusted_client_keystore` is `untrusted_client`.

### Running the tests

To execute the tests run the following command:
```
$ mvn test
``` 

This will make the test of the class `HTTPSApiTest` fail with the message:
```java
javax.net.ssl.SSLHandshakeException: sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
```
Because the trust store where the CA certificate is stored is not passed to the application. To run the tests passing the trust store information use the following command:
```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=Gr4d14nt
```
Again the test of the class `HTTPSApiTest` will fail, but this time with the message:
```java
{"message":[{"code":"401","status":"denied","message":"Authorization failed: a client certificate is needed","path":["/v1/forward/domain"]}]}
```
Because the keystore where the client certificate is stored is not passed to the application. To run again the tests but this time passing the key store information use one of the following commands depending of the type of chosen keystore, 'JKS' or 'PKCS12':
```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=Gr4d14nt -Djavax.net.ssl.keyStore=keystore/untrusted_client_keystore.pkcs12 -Djavax.net.ssl.keyStorePassword=Gr4d14nt -Djavax.net.ssl.keyStoreType=PKCS12 -DclientCertificateAlias=untrusted_client
```
or
```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=Gr4d14nt -Djavax.net.ssl.keyStore=keystore/untrusted_client_keystore.jks -Djavax.net.ssl.keyStorePassword=Gr4d14nt  -DclientCertificateAlias=untrusted_client
```
The parameter `clientCertificateAlias` is a custom parameter to tell the SSLEngine to pick the certificate with the provided alias from the key store. This parameter is needed because the Java default implementation of the SSLEngine picks the first certificate from the key store that is valid against the same CA that signed the server certificate, for this reason a client certificate signed by a different CA wouldn't be picked by the default SSLEngine. This parameter can also be used to choose which certificate to use when there is more than one in the key store.
The test of the `HTTPsApiTest` will continue failing, but again with a different message:
```java
{"message":[{"code":"401","status":"denied","message":"Authorization failed: wrong certificate provided","path":["/v1/forward/domain"]}]}
```
Because the passed key store contains a client certificate that is not trusted by the broker CA. Finally to run the tests passing a key store that contains a trusted client, use one of the following commands depending of the type of chosen keystore, 'JKS' or 'PKCS12': 

```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=Gr4d14nt -Djavax.net.ssl.keyStore=keystore/client_td_keystore.pkcs12 -Djavax.net.ssl.keyStorePassword=Gr4d14nt -Djavax.net.ssl.keyStoreType=PKCS12
```
or
```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=Gr4d14nt -Djavax.net.ssl.keyStore=keystore/client_td_keystore.jks -Djavax.net.ssl.keyStorePassword=Gr4d14nt
```
This time the test of the `HTTPsApiTest` will succeed.

For further information regarding the Java tests refer to the file [tests/java/README.md](tests/java/README.md).

## Using HTTP for testing

For testing and developing purposes, we allow communication over non-secured http protocol on port 5000 instead of 5043 (default configuration). When the Broker receives an http connection acts as if the client had provided a valid certificate, so the request will allways be authorized. This means that in order to test token validation an https connection is needed.
Also the internal calls made by the Broker can be done through HTTP or HTTPS. This can be set up with the following parameter of the configuration file:
```json
  protocol: "http|https"
```
Currently all the internal calls support HTTPS, except the calls to IAM and Cloudify, that only support HTTP and are currently done always unsecured.

The HTTP endpoint of the Broker can be disable with the following configuration parameter:
```json
    testing: false
```
Or with the ENV variable `TESTING=false` in the ENV file passed to Docker.

## Example of complete workflow execution
In order to make a test of the complete workflow with dummy services deployed by Cloudify we created two blueprints. We then deployed 2 brokers, 2 services (one in the TD and other in the UD) and a dummy PO component with these blueprints.
Once all the services are up and running, we execute the script 'workflow_test.sh' which creates two requests to the untrusted domain and prints the results.
Below you can find a screenshot of this execution.
![RESULTS](./Image.png)

## Testing with dummy services
The code for the dummy services we used for the workflow test can be foun in [this repository.](https://gitlab-witdom.xlab.si/gonzalo.jimenez/dummy_service_for_testing)
This code creates a server which exposes three REST APIs; one for acting as a dummy PO, other for acting as a trusted domain service and the last one for acting as the untrusted service.
Both trusted and untrusted domain services allow responding with callback after a few seconds or in the request response.

The ENV files for configuring the parameters of the dummy services can be found in the files `env/po.env`, `env/service_td.env` and `env/service_ud.env`.

The testing environment for the workflow test can be run locally with docker-compose using the provided file 'docker-compose-workflow-test.yml'. First it's necessary to build the dummy-service image and give it the name 'dummy-service', after that the environment can be set up with the commands:

```bash
$ docker-compose -f docker-compose-workflow-test.yml build  # Builds images
$ docker-compose -f docker-compose-workflow-test.yml up     # Creates and starts containers
```

The script `workflow_test.sh` contains 16 test, 8 for each domain. Once all the containers are up the workflow test can be run with the following command:
```bash
$ ./workflow_test.sh
```

Once the test is done the containers can be stopped and removed:
```bash
$ docker-compose -f docker-compose-workflow-test.yml down
```

We also provide the script `workflow_test_https.sh` that runs the same test but internally uses HTTP. It also first obtains a token from the IAM and uses it in all the requests to the Broker. To run this script first it is necessary to edit the file `env/common.env` and change `PROTOCOL` to `https`. It is also necessary to change the port used to connect to the dummy services by editing the files `env/td.env` and `env/ud.env` and changing the port of services `po`, `trusted-service` and `untrusted-service` from `8080` to `8443`.
