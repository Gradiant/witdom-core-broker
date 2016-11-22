# Contents of the Broker cloudify orchestration module

## Directory listing
The orchestration module contains the following directories and files (not all the files in subdirectories are listed):
 - lib
   - cloudify.js (Main file with all the internal logic and API offered functions)
   - cloudifyError.js (Definition of the error launched by the module)
 - tests (Folder with example unit tests)
 - index.js (Main loadable file)
 - package.json
 - README.md (this file)

## API functions
 - connect (initializes the connection and loads configuration)
 - getServiceData (gets the information of the service identified by the given service name)
 - getServiceList (gets the information of all the services deployed)

## Configuration
```
    orchestrator: {
        name: 'cloudify_provider_connector',                    // Installed module name to import
        config: {
            protocol: 'http',                                   // Connection protocol
            host: 'localhost',                                  // Cloudify API host
            port: '1234',                                       // Cloudify API port
            auth_token: 'some token',                           // Auth mechanism (TBD)
            certificate_key: './CAs/witdomCA/client1_key.pem',  // Client certificate key
            certificate: './CAs/witdomCA/client1_crt.pem',      // Client certificate
            ca: './CAs/witdomCA/witdomcacert.pem'               // Client trusted CA
        }
    }
```