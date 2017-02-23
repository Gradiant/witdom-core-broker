# Contents of the WITDOM Broker core component repository

## Directory listing
The broker repository contains the following directories and files (not all the files in subdirectories are listed):
 - api
   - swagger.yaml (Api specification in swagger format)
 - blueprints (directory with blueprint prototypes for deploying the trusted and untrusted brokers with some dummy services)
 - CAs (several self-signed CAs (along signed server and client certificates) created with testing purposes, and also instructions to create new ones)
 - certs (server and ca certificates for testing)
 - config (broker configuration)
 - controllers (nodejs controllers for servicing request to the broker)
 - dependencies (this directory is a git submodule that clones the IAM repository for access the IAM javascript client module)
 - models (mongoose database models)
 - orchestration (default orchestration connection modules)
 - protection (default protection orchrestrator communication module)
 - request (contains a module for doing rest calls)
 - request_forwarding (broker's core module)
 - service_info (an utility module to retrieve info about available services)
 - tests (nodejs tests and java api client library with example calls)
   - nodejs
   - java
 - utils (nodejs server handlers)
 - validators (this directory contains 'dummyTokenValidation' that serves as an example on how to create a module to connect to a different token validation service)
 - broker.js
 - broker_docker.sh (script for launching TD and UD Broker containers along with mongo containers for both)
 - docker-compose.yml (Dockercompose yaml file used for creating and launching the needed containers for TD and UD Brokers)
 - Dockerfile
 - dockerFileCustom.js (a custom config file for replacing 'config/custom.js' when building the Dockerfile)
 - package.json
 - README.md (this file)


## Broker configuration
WITDOM broker component uses JSON style configurariton files. The default configuration is inside 'config/default.js', a custom configuration can be entered by providing the desired fields in the file 'config/custom.js'.

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
This will start the broker using the contents of the file `custom_config.js` to override the default configuration. Two files are provided for running 2 instances of the Broker (TD and UD) using a local installation of nodejs. The files are `td_custom.js` and `ud_custom.js`. Using these two files for running both Brokers it is also necessary to add the following lines to the file `/etc/hosts` so the Brokers can see each other.
```
127.0.0.1 broker-td
127.0.0.1 broker-ud
```
Also the TD broker needs a mongo server listening in the port 27017 and the UD broker a mongo server in the port 27018. An IAM listening at the port 5001 is also needed.

## Deployment of the broker with Dockerfile
There are two provided ways to deploy the trusted domain and the untrusted domain instances of the Broker. The first one creates a docker image for each domain (using a custom Dockerfile for each one) and the configuration for the domain is set at the time the docker image is built, so in order to change the configuration of that Broker instance it's necessary to rebuild the image. The other way uses the same Dockerfile for all domains, and is configurable through an environment variables file that is read when the container is started. This way it's possible to change the container configuration just by running it again with a different environment file without the need of rebuilding the docker image. The first way is explained first.

### Using one docker image for each Broker domain

First edit the files 'broker_td_custom_config.js' and 'broker_ud_custom_config.js' to configure the trusted domain broker and untrusted domain broker. The ports of the broker and the configuration of the certificates can be also be set up in these files.
For example to change the port of the HTTP connector edit the custom file of one of the Brokers and edit the following line:

```javascript
    http: { port: 5000 }
```
If the default port configuration is changed it has to be updated also in the Dockerfiles `Dockerfile_td` and `Dockerfile_ud`.

```
EXPOSE <http_port>
EXPOSE <https_port>
```
Note that any change made to the configuration of the custom files for each broker will need to be reflected in the explanations that are shown below.

Once the configuration is done there are two ways to deploy a testing environment with both brokers. The first one is using the provided script `broker_docker.sh` that uses docker ambassador containers to interconnect both Brokers. The other is using docker-compose with the provided yaml configuration in the file `docker-compose.yml`, this second way is way easier than the first one, so it is recommended. Below the deployment with both methods is explained.

#### Using broker_docker.sh

The first thing to do is build the images for both Brokers. To build the docker image for the trusted broker run the following command:
```
$ ./broker_docker.sh --command=rebuild-images --dockerfile=Dockerfile_td --image-name=witdom-core-broker-td --container-name=broker_td
```
And for the untrusted broker:
```
$ ./broker_docker.sh --command=build-images --dockerfile=Dockerfile_ud --image-name=witdom-core-broker-ud --container-name=broker_ud
```
The TD broker needs a running instance of the IAM.

Then run the mongo containers (this step is optional, the script `broker_docker.sh` will run the mongo containers if they don't exist)
```
$ docker run --name mongo-broker-td -d mongo
$ docker run --name mongo-broker-ud -d mongo
```

Then run the trusted docker container:
```
$ ./broker_docker.sh --command=run-containers --image-name=witdom-core-broker-td --container-name=broker_td --mongo-container=mongo-broker-td --container-http-port=5000 --container-https-port=5043 --host-http-port=5000 --host-https-port=5043 --remote-host=<YOUR_MACHINE_IP> --remote-http-port=5100 --remote-https-port=5143 --other-domain-name=broker-ud --use-iam=yes --iam-container=iam
```
And the untrusted docker container:
```
$ ./broker_docker.sh --command=run-containers --image-name=witdom-core-broker-ud --container-name=broker_ud --mongo-container=mongo-broker-ud --container-http-port=5000 --container-https-port=5043 --host-http-port=5100 --host-https-port=5143 --remote-host=<YOUR_MACHINE_IP> --remote-http-port=5000 --remote-https-port=5043 --other-domain-name=broker-td
```

To stop the trusted container:
```
$ ./broker_docker.sh --command=stop-containers --container-name=broker_td
```
Same for the untrusted container:
```
$ ./broker_docker.sh --command=stop-containers --container-name=broker_ud
```

To start the containers again
```
$ ./broker_docker.sh --command=start-containers --container-name=broker_td
$ ./broker_docker.sh --command=start-containers --container-name=broker_ud
```

To fresh start the containers from the images first run
```
$ ./broker_docker.sh --command=remove-containers --container-name=broker_td
$ ./broker_docker.sh --command=remove-containers --container-name=broker_ud
```

And then run them again as it was explained above.


#### Using Dockercompose

For using dockercompose the file docker-compose.yml is provided. To build and run the containers run the following commands:
```bash
$ docker-compose build  # Builds images
$ docker-compose up     # Creates and starts containers
```
After running the above commands, you will see the output log of all the deployed docker containers in the same window. If you want to prevent this behaviour, you can add the '-d' option to the `docker-compose up` command, which will start the containers in detached mode. In this case, standard output of all docker containers can be obtained by running `docker-compose logs`.

To stop and remove the cointainers run the following command (if you run the cointers with `docker-compose up` you'll need to open a new terminal window in the same directory to run the command)
```bash
$ docker-compose down
```


### Using the same docker image for each Broker container

A Dockerfile file is provided for building a docker image that can be used for both Broker domains ('Dockerfile'). Once the docker image is built the configuration of the container can be customized when running it by providing a environment file like the following:

```
BROKER_HTTP_PORT=5000                       # HTTP port of the Broker inside the container
BROKER_HTTPS_PORT=5043                      # HTTPS port of the Broker inside the container
BROKER_CERT=certs/broker_td_crt.pem         # TLS certificate of the Broker
BROKER_KEY=certs/broker_td_key.pem          # Key of the certificate
BROKER_KEY_PASSPHRASE=Gr4d14ntBr0k3r        # Passphrase of the key (in case it's encrypted)
CA_CERTS=certs/tdcacert.pem                 # Certificates of the CAs that provided the certificates of the WITDOM services (more than one CA can be provided using the ',' as separator, for example for using differnet CAs for the trusted and untrusted domains)
BROKER_PROTOCOL=http                        # Protocol used by the Broker to communicate with other components (http|http)
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
ORCHESTRATOR=mock_example                   # Module used for communicate with the orchestrator (cloudify_provider_connector|mock_example)
MOCK_SERVICES=po:{host:"po",port:"8080"}    # List of services in JSON format to configure in the 'mock_example' module
CLOUDIFY_HOST=cloudify                      # Hostname of Cloudify (only for module 'cloudify_provider_connector')
CLOUDIFY_PORT=80                            # Port of Cloudify (only for module 'cloudify_provider_connector')
RETRIES=8                                   # Number of retries to do when there is a network error when communicating with other components
PO_ID=po                                    # ID of the PO defined in the cloud orchestrator
LOGGING_LEVEL=silly                         # Logging level (error|warn|info|verbose|debug|silly)
```

It's not recommended to change the value of 'BROKER_HTTP_PORT' and 'BROKER_HTTPS_PORT' because the default values are hardcoded in 'Dockerfile', for this reason if any of those values are changed the 'Dockerfile' has also to be changed accordingly and the docker image has to be rebuilt.

A docker-compose file ('docker-compose-one-image.yml') is provided in order to launch a testing environment using the image created with 'Dockerfile', this environment launches two Broker containers (TD and UD) along with a mongo container for each one and an IAM container. The configuration used in each Broker is contained in the files `td.env` and `ud.env`.

To build the images and run the containers use the following commands:

```bash
$ docker-compose -f docker-compose-one-image.yml build  # Builds images
$ docker-compose -f docker-compose-one-image.yml up     # Creates and starts containers
```

And to stop and remove them:
```bash
$ docker-compose -f docker-compose-one-image.yml down
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
These tests also check the functionality of mutual identification with client and server certificates. The CA and client certs to use in the tests can also be configured in the file `tests/nodejs/integration/config/custom.js` this way:

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

To launch the tests just run the following command:
```
$ npm test
```

If you don't want to run the test that use the HTTPS endpoint just run:
```
$ npm run api_test
```

### Broker deployed in Docker containter

To launch the nodejs tests using the Brokers in the docker containers use the same procedure as in the locally deployed broker, that is, change the default test configuration in `tests/nodejs/integration/config/custom.js` and run the command:
```
$ npm test
``` 

## Launching nodejs unit tests
The unit tests don't need a running instance of the Broker, but some of them need an instance of the IAM and mongo. With the default configuration the IAM must be listening in the port 5001 and the mongo in the port 27017.
The unit test available are the following:
```bash
$ npm run db_test       # database tests
$ npm run request_test  # requests module tests
$ npm run token_test    # IAM and dummy token validation modules tests
$ npm run si_test       # ServiceInfo module tests
$ npm run mocksi_test   # MockServiceInfo module tests
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
For the mutual authentication a client certificate must be provided to the broker along the request. This certificate is read by a Java application from the selected key store. The java 'keytool' command can't be used to directly create this key store because it doesn't allow to import a key when generating the key store, the only option is to create a new key along the key stotre creation. So the openssl tool is used to create the new key store in PKCS12 format and to import into it the client key and certificate. First the client key and the client certificate must be concatenated in one file:
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

A preconfigured truststore is provided in the file `tests/java/truststore/truststorefile`, and two keystores (both in PKCS12 and JKS format )in the files `tests/java/keystore/trusted_client_keystore.pkcs12`, `tests/java/keystore/trusted_client_keystore.jks`, `tests/java/keystore/untrusted_client_keystore.pkcs12` and `tests/java/keystore/untrusted_client_keystore.jks`. The password for the trust store and the key stores is `W1td0m`. The alias of the certificate in the `trusted_client_keystore` is `client1`, and in the `untrusted_client_keystore` is `untrusted_client`.

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
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=W1td0m
```
Again the test of the class `HTTPSApiTest` will fail, but this time with the message:
```java
{"message":[{"code":"401","status":"denied","message":"Authorization failed: a client certificate is needed","path":["/v1/forward/domain"]}]}
```
Because the keystore where the client certificate is stored is not passed to the application. To run again the tests but this time passing the key store information use one of the following commands depending of the type of chosen keystore, 'JKS' or 'PKCS12':
```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=W1td0m -Djavax.net.ssl.keyStore=keystore/untrusted_client_keystore.pkcs12 -Djavax.net.ssl.keyStorePassword=W1td0m -Djavax.net.ssl.keyStoreType=PKCS12 -DclientCertificateAlias=untrusted_client
```
or
```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=W1td0m -Djavax.net.ssl.keyStore=keystore/untrusted_client_keystore.jks -Djavax.net.ssl.keyStorePassword=W1td0m  -DclientCertificateAlias=untrusted_client
```
The parameter `clientCertificateAlias` is a custom parameter to tell the SSLEngine to pick the certificate with the provided alias from the key store. This parameter is needed because the Java default implementation of the SSLEngine picks the first certificate from the key store that is valid against the same CA that signed the server certificate, for this reason a client certificate signed by a different CA wouldn't be picked by the default SSLEngine. This parameter can also be used to choose which certificate to use when there is more than one in the key store.
The test of the `HTTPsApiTest` will continue failing, but again with a different message:
```java
{"message":[{"code":"401","status":"denied","message":"Authorization failed: wrong certificate provided","path":["/v1/forward/domain"]}]}
```
Because the passed key store contains a client certificate that is not trusted by the broker CA. Finally to run the tests passing a key store that contains a trusted client, use one of the following commands depending of the type of chosen keystore, 'JKS' or 'PKCS12': 

```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=W1td0m -Djavax.net.ssl.keyStore=keystore/trusted_client_keystore.pkcs12 -Djavax.net.ssl.keyStorePassword=W1td0m -Djavax.net.ssl.keyStoreType=PKCS12
```
or
```
$ mvn test -Djavax.net.ssl.trustStore=truststore/truststore.jks -Djavax.net.ssl.trustStorePassword=W1td0m -Djavax.net.ssl.keyStore=keystore/trusted_client_keystore.jks -Djavax.net.ssl.keyStorePassword=W1td0m
```
This time the test of the `HTTPsApiTest` will succeed.

For further information regarding the Java test refer to the file [tests/java/README.md](tests/java/README.md).

## Using HTTP for testing

For testing and developing purposes, we allow communication over non-secured http protocol on port 5000 instead of 5043 (default configuration). When the broker receives an http connection acts as if the client had provided a valid certificate, so the request will allways be authorized. This means that in order to test token validation an https connection is needed.
Also the internal calls made by the Broker can be done through HTTP or HTTPS. This can be set up with the following parameter of the configuration file:
```json
  protocol: "http|https"
```
Currently only some of the internal calls support HTTPS, so for testing and integration purposes it is recommended to use HTTP

## Example of complete workflow execution
In order to make a test of the complete workflow with dummy services deployed by cloudify we created two blueprints. We then deployed 2 brokers, 2 services (one in the TD and other in the UD) and a dummy PO component with these blueprints.
Once all the services are up and running, we execute the script 'workflow_test.sh' which creates two requests to the untrusted domain and prints the results.
Below you can find a screenshot of this execution.
![RESULTS](./Image.png)

## Testing with dummy services
The code for the dummy services we used for the workflow test can be foun in [this repository.](https://gitlab-witdom.xlab.si/gonzalo.jimenez/dummy_service_for_testing)
This code creates a server which exposes three REST APIs; one for acting as a dummy PO, other for acting as a trusted domain service and the last one for acting as the untrusted service.
Both trusted and untrusted domain services allow responding with callback after a few seconds or in the request response.

The testing environment for the workflow test can be run locally with docker-compose using the provided file 'docker-compose-one-image-workflow-test.yml'. First it's necessary to build the dummy-service image and give it the name 'dummy-service', after that the environment can be set up with the commands:

```bash
$ docker-compose -f docker-compose-one-image-workflow_test.yml build  # Builds images
$ docker-compose -f docker-compose-one-image-workflow_test.yml up     # Creates and starts containers
```

Once all the containers are up the workflow test can be run with the following command:
```bash
$ ./workflow_test.sh
```

Once the test is done the containers can be stopped and removed:
```bash
$ docker-compose -f docker-compose-one-image-workflow_test.yml down
```