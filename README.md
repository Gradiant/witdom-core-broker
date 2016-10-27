# Contents of the WITDOM Broker core component repository

## Directory listing
The broker repository contains the following directories and files (not all the files in subdirectories are listed):
 - api
   - swagger.yaml (Api specification in swagger format)
 - config (broker configuration)
 - controllers (nodejs controllers for servicing request to the broker)
 - tests (nodejs tests and java api client library with example calls)
   - nodejs
   - java
 - CAs (several self-signed CAs (along signed server and client certificates) created with testing purposes, and also instructions to create new ones)
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
$ docker run --name broker -p 5000:5000 -p 5043:5043 -d witdom-core-broker
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
Prior to launching the tests the HTTP and HTTPS ports must be configured if the default ports have been changed in the running broker. To do this edit the file 'tests/nodejs/config/custom.js' with the following content, changing the ports to the right values:

```javascript
module.exports = {
    http: { port: 5000 },
    https: {
        port: 5043,
    }
};
```
These test also check the functionality of mutual identification with client and server certificates. The CA and client certs to use in the tests can also be configured in the file 'tests/config/custom.js' this way:

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

To launch the nodejs test using the broker in the docker container use the same procedure as in the locally deployed broker but run the following command before launching the tests:
```
$ npm run docker-pretest
```

This command will inject the Docker host IP into the broker container, making it recognize the requests made from the Docker host as if it they were made by a witdom internal service, requiring the requests made using HTTPS protocol provide a client certificate.
After that run the following command to do the tests:
```
$ npm test
``` 

## Launching java API tests

The Java test are inside the directory tests/java. This directory contains a maven script 'pom.xml' that can be used to compile and package the API client library and to run the example tests.
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
For the mutual authentication a client certificate must be provided to the broker along the request. This certificate is read by a Java application from the selected key store. The java 'keytool' command can't be used to directly create this key store because it doen't allow to import a key when generating the key store, the only option is to create a new key along the key stotre creation. So the openssl tool is used to create the new key store in PKCS12 format and to import into it the client key and certificate. First the client key and the client certificate must be concatenated in one file:
```
$ cat <client_key_file> <client_crt_file> > client_key_crt.pem
```
After that to create the PKCS12 key store use the following command:
```
$ openssl pkcs12 -export -in client_key_crt.pem -out client_keystore.pkcs12 -name client -noiter -nomaciter
```
Where `-name client` indicates an alias for the key_cert inside the key store. After executing this command a prompt requesting a password for the key store will appear. After creating the key store it can be converted from PKCS12 to JKS format with the following command:
```
$ keytool -importkeystore -deststorepass <password_of_jks_keystore> -destkeypass <password_of_the_key_in_jks> -destkeystore <jks_file> -srckeystore <pkcs12_file> -srcstoretype PKCS12 -srcstorepass <pkcs12_passwrod> -alias client
```
Use the same password for `-deststorepass`  and `-destkeypass`, and for `-alias` use the same value as in `-name` for the 'openssl' command. To use the created trust store in a Java application the JVM must be invoked with the following params for the case of the PKCS12 format:
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
{"message":[{"code":"401","status":"denied","message":"Authorization failed: a client certificate is needed"}]}
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
{"message":[{"code":"401","status":"denied","message":"Authorization failed: a client certificate is needed"}]}
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



For further information refer to the file `tests/java/README.md`.