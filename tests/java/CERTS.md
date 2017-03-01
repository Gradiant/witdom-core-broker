# How to import the CA certificate to a trust store, the client certificate and key to a key store and use them in a java application

## Importing CA certificate to a trust store

To import a CA certificate to a new trust store invoke the following command:
```
$ keytool -import -alias tdca -file tdcacert.pem -keystore appkeystore
```

A prompt for the trust store key will be requested.


## Import client certificate and key to a key store

'keytool' doesn't support importing a key into a key store, so we need to use openssl to create a pkcs12 keystore. First the key and certificate must be concatenated in the same file:
```
$ cat client_td_key.pem client_td_crt.pem > client_td_key_crt.pem
```
Then create the PKCS12 keystore with the following command:
```
$ openssl pkcs12 -export -in client_td_key_crt.pem -out client_td_keystore.pkcs12 -name client_td -noiter -nomaciter
```

## Using the trust store and key store with a Java application

To use the generated trust store and key store with a Java application some parameters have to be passed to the JVM with -D option. For the trust store:
```
$ -Djavax.net.ssl.trustStore=<truststorename> -Djavax.net.ssl.trustStorePassword=<truststorepassword>
```
For the key store:
```
$ -Djavax.net.ssl.keyStore=<keystorename> -Djavax.net.ssl.keyStorePassword=<keystorepassword> -Djavax.net.ssl.keyStoreType=PKCS12
```
To invoke the maven tests using the trust store and the keystore use the following command:
```
$ mvn test -Djavax.net.ssl.trustStore=<truststorename> -Djavax.net.ssl.trustStorePassword=<truststorepassword> -Djavax.net.ssl.keyStore=<keystorename> -Djavax.net.ssl.keyStorePassword=<keystorepassword> -Djavax.net.ssl.keyStoreType=PKCS12
```

## Converting a PKCS12 keystore to a Java key store

To convert a PKCS12 keystore generated with open ssl use the following command:
```
$ keytool -importkeystore -deststorepass Gr4d14nt -destkeypass Gr4d14nt -destkeystore keystore/client_td_keystore.jks -srckeystore keystore/client_td_keystore.pkcs12 -srcstoretype PKCS12 -srcstorepass Gr4d14nt -alias client_td
```
With a Java key store the parameters to pass to the JVM are:
```
$ -Djavax.net.ssl.keyStore=<keystorename> -Djavax.net.ssl.keyStorePassword=<keystorepassword>
```
Becase the default type is JKS
