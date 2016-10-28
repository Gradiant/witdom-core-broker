# How to create server and client certificates
---------------------------------------------

## CA creation

In order to create certificates for the test phase a self-signed CA has been created. The configuration for creating the CA is in the file 'witdomcaconfig.cnf'.

The created CA is formed by the following files:
  - CA certificate: 'witdomcacert.pem'
  - CA private key: 'private/witdomcakey.pem'
  - CA index file: 'index.txt'. Keys an index of the signed certificates by this CA
  - CA serial file: 'serial'. Contains the serial number of the next certificate to create

The CA private key is protected with the passpharse 'W1td0m'.

The commands needed to generate the CA certificate from config file are the following:

First inside the CA directory create the subdirectories 'private' and 'signedcerts'
```
$ mkdir private && mkdir signedcerts
```

Then create the files 'index.txt' and 'serial'
```
$ touch index.txt && echo 01 > serial
```

Then edit the file 'witdmocaconfig.cnf' and change the values of 'dir' under 'local_ca', and of 'default_key_file' under 'req'.
```
$ openssl req -config witdomcaconfig.cnf -x509 -newkey rsa:2048 -out witdomcacert.pem -outform PEM -days 1825
```

This will prompt you for a passphrase to protect the generated private key of the CA certificate .
A 2048-bit private key will be created in the path indicated by 'default_key_file' in the file 'witdomcaconfig.cnf'.
The certificate will be saved in the path indicate by 'certificate' under 'local_ca' in the file 'witdomcaconfig.cnf'.



Once we have the CA certificate and its private key, we can create server and client certificates signing requests and sign certificates.

## Server certificates

A server certificate has been created for the broker using 'localhost' as common name. The configuration for creating this certificate is in the file 'broker.cnf'. After generating this certificate 2 files have been generated, 'broker_crt.pem' (the certificate file) and 'broker_key.pem' (the certificate private key that is encrypted with the passphare 'W1td0mBr0k3r').

To generate a certificate for another server copy the file 'broker.cnf' and change the field 'commonName' under 'witdom_broker' and the the field 'DNS.1' under 'alt_names' to the name of the domain that the server this certificate is created for will be listening to petitions. After that run the following commands to generate the certificate and the private key:
```
$ openssl req -config broker.cnf -newkey rsa:4096 -keyout broker_key.pem -keyform PEM -out broker_req.pem -outform PEM
```

This will prompt you for a passphrase to protect the generated private key. After the execution of this command two files will be created, 'broker_key.pem' (the private key) and 'broker_req.pem' (a certificate signing request that we need to sign with the generated CA).
```
$ openssl ca -config witdomcaconfig.cnf -in broker_req.pem -out broker_crt.pem
```

This will sign the certificate signing request generating the certificate in the file 'broker_crt.pem'. The command will prompt you to enter the passphrase of the ca private key.


## Client certificates

An example client certificate is provided in the file 'client1_crt.pem', its associated private key is in the file 'client1_key.pem'. Also the certificate in PKCS#12 format is provided in the file client1_crt.pfx. This client certificate can be imported in a web browser.

To generate a new client certificate copy the file 'client1.cnf' and edit the field 'commonName' under 'witdom_client'. Generate a private key for the client with the following command:
```
$ openssl genrsa -out client1_key.pem 4096
```

This will generate a 4096-bit RSA key for the client. After that generate the certificate signing request for the client with the following command using the generated key:
```
$ openssl req -new -config client1.cnf -key client_key.pem -out client_req.pem -outform PEM
```

And sign the signing request with:
```
$ openssl ca -config witdomcaconfig.cnf -in client_req.pem -out client_crt.pem
```

This will generate and store the certificate in the file 'client_crt.pem'. To convert the certificate to PKCS#12 so it can be imported by a web browser use the following commands:
```
$ cat client_key.pem client_crt.pem > client_key_and_crt.pem
```
```
$ openssl pkcs12 -export -out client_crt.pfx -in client_key_and_crt.pem  -name "Client Certificate"
```

The first command concatenates the key and the certificate in the same file, and the second command converts the certificate to PKCS#12 format (this command would ask for a passphrase to protect the certificate, it can be left blank), storing it in the file 'client_crt.pfx'.


## Other usefull commands

The content of a certificate can be viewed with the following command:
```
$ openssl x509 -in cert.pem -text -noout
```

An encrypted private key can be decrypted with the following command (the user will be prompted to enter the key passphrase):
```
$ openssl rsa < key.pem > decrypted_key.pem
```
